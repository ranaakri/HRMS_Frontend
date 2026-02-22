import { Card } from "@/components/ui/card";
import { type Games } from "./ListAllGames";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { useDebounce } from "@/hook/DebounceHoot";
import { useEffect, useState } from "react";
import { notify } from "@/components/custom/Notification";
import type { IUserList } from "@/components/custom/AddUserToTravel";
import { Input } from "@/components/ui/input";
import type { User } from "../General/ExpenseList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { type CreatedByUser } from "../HR/UpdateTravel";

const DateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};

interface BookSlot {
  userIds: number[];
  slotId: number;
  requestedBy: number;
}

export interface BookingResponse {
  priority: number;
  requestId: number;
  requestedBy: RequestedBy;
}

export interface RequestedBy {
  email: string;
  name: string;
  userId: number;
}

export interface SlotInfo {
  endTime: string;
  slotId: number;
  startTime: string;
  status: string;
}

export default function BookSlot() {
  const { gameId, slotId } = useParams();

  const { user } = useAuth();

  

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => api.get(`/game/${gameId}`).then((res) => res.data),
  });

  const slotData = useQuery({
    queryKey: ["slotInfo", slotId],
    queryFn: () =>
      api.get(`/game/slots/info/${slotId}`).then((res) => res.data),
    enabled: !!slotId,
  });

  const slotInfo: SlotInfo | undefined = slotData.data;

  const checkBooking = useQuery({
    queryKey: ["checkhasBooking", user?.userId, slotId],
    queryFn: async () =>
      await api
        .get(`/game-bookings/check-booking/user/${user?.userId}/slot/${slotId}`)
        .then((res) => res.data),
    enabled: !!user?.userId && !!slotId,
  });

  const hasBooking = checkBooking.data;

  const getStatus = useQuery({
    queryKey: ["checkhasBooking", user?.userId, slotId, hasBooking],
    queryFn: async () => {
      return await api
        .get(`/game-bookings/get/user/${user?.userId}/slot/${slotId}`)
        .then((res) => res.data);
    },
    enabled: !!user?.userId && !!slotId && !!hasBooking && !!checkBooking.data,
  });

  const bookingList = useQuery({
    queryKey: ["bookingList", slotId],
    queryFn: async () => {
      return await api.get(`/game-bookings/${slotId}`).then((res) => res.data);
    },
    enabled: !!slotId,
  });

  const bookingsData: BookingResponse[] = bookingList.data || [];

  const bookingPartners = useQuery({
    queryKey: ["getBookingPartners", user?.userId, slotId],
    queryFn: async () => {
      const data = await api
        .get(`/game-bookings/partners/user/${user?.userId}/slot/${slotId}`)
        .then((res) => res.data);
      return data;
    },
    enabled: !!user?.userId && !!slotId && !!checkBooking.data,
  });

  const gamePartner: CreatedByUser[] = bookingPartners.data || [];

  const deleteBooking = useMutation({
    mutationFn: async () => {
      await api
        .delete(`/game-bookings`, {
          data: { slotId: slotId, requestedBy: user?.userId },
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Booking request deleted");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
      return;
    },
  });

  if (isLoading || slotData.isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError || slotData.isError)
    return (
      <div className="text-red-500">
        Error: {error?.message || slotData.error?.message}
      </div>
    );

  if (!data || !slotInfo) {
    return (
      <div className="flex items-center justify-center">
        Game or Slot information not found.
      </div>
    );
  }

  const renderBookingAction = () => {
    if (checkBooking.isLoading) return <div>Checking booking...</div>;

    if (hasBooking) {
      if (getStatus.isLoading) return <div>Loading status...</div>;
      return (
        <div className="p-4 border rounded bg-blue-50">
          {getStatus.data ? (
            <div className="">
              <div className="flex justify-between items-center">
                <span className="font-bold">
                  Your Booking Status: {getStatus.data || "PENDING"}
                </span>

                {slotInfo.startTime &&
                  new Date() < new Date(slotInfo.startTime) && (
                    <Button
                      variant={"destructive"}
                      className="bg-red-400 ml-5"
                      type="button"
                      onClick={() => deleteBooking.mutate()}
                      disabled={deleteBooking.isPending}
                    >
                      Delete
                    </Button>
                  )}
              </div>
              <div className="flex mt-2 gap-4">
                {bookingPartners.isSuccess && gamePartner.length > 0 ? (
                  gamePartner.map((item) => (
                    <div
                      className="p-2 bg-white rounded-md border"
                      key={item.userId + "_user"}
                    >
                      {item.name}
                    </div>
                  ))
                ) : (
                  <div className="">No game partners found</div>
                )}
              </div>
            </div>
          ) : (
            <div className=""></div>
          )}
        </div>
      );
    }

    return (
      <div className="">
        {slotInfo.startTime && new Date() < new Date(slotInfo.startTime) && (
          <AddUserToGame min={data.minPlayers} max={data.maxPlayers} />
        )}
      </div>
    );
  };

  return (
    <Card className="grid grid-cols-1 md:grid-cols-3 p-2 min-h-full bg-white">
      <div className="col-span-2">
        <div className="flex flex-col gap-2 border-r p-5 min-h-full">
          <GamesCard game={data} slot={slotInfo} active={false} />
          {renderBookingAction()}
        </div>
      </div>
      <div className="">
        {bookingList.isLoading ? (
          <div className="">Loading...</div>
        ) : bookingList.isError ? (
          <div className="">Error: {bookingList.error.message}</div>
        ) : (
          <div className="">
            <div className="text-gray-500 text-xl mb-2 overflow-auto">
              Bookings
            </div>
            {bookingsData.length > 0 ? (
              bookingsData.map((item, index) => (
                <div
                  className="flex items-center bg-black text-white shadow-md rounded-md p-2 m-2"
                  key={item.requestId}
                >
                  <p className="mr-5">{index + 1}.</p>
                  <BookingCard item={item} />
                </div>
              ))
            ) : (
              <div className="">No Bookings</div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function BookingCard({ item }: { item: BookingResponse }) {
  return (
    <div className="bg-black text-white">
      <p>{item.requestedBy.name}</p>
      <p>{item.requestedBy.email}</p>
    </div>
  );
}

function GamesCard({ game, active, slot }: { game: Games; active: boolean, slot: SlotInfo }) {
  return (
    <Card className="shadow-none border-0 p-5 md:p-10">
      <div className="font-bold text-2xl text-gray-700">{game.name}</div>
      <div className="flex items-center gap-4">
        <p className="">
          <b>Min. Palyers:</b> {game.minPlayers}
        </p>
        <p className="">
          <b>Max. Palyers:</b> {game.maxPlayers}
        </p>
      </div>
      <div className="">
        <b>Slot Duration:</b> {game.slotDuration}
      </div>
      <div className="flex items-center gap-4">
        <p className="">
          <b>Opening Time:</b> {game.openTime}
        </p>
        <p className="">
          <b>Closing Time:</b> {game.closeTime}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <p className="">
          <b>Slot Start time:</b> {new Date(slot.startTime).toLocaleTimeString(
            undefined,
            DateOptions,
          )}
        </p>
        <p className="">
          <b>Slot Closing Time:</b> {new Date(slot.endTime).toLocaleTimeString(
            undefined,
            DateOptions,
          )}
        </p>
      </div>
      {active && <div className="">{game.active}</div>}
    </Card>
  );
}

function AddUserToGame({ min, max }: { min: number; max: number }) {
  const { slotId } = useParams();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [userList, setUserList] = useState<IUserList[]>([]);
  const [gamePartner, setGamePartner] = useState<User[]>([]);

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
    setGamePartner((prev) => {
      const alreadyAdded = prev.some((u) => u.userId === user.userId);
      if (alreadyAdded) return prev;
      return [
        {
          userId: user.userId,
          name: user.name,
          email: user.email,
        },
        ...prev,
      ];
    });
  }, [user]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }

    if (debouncedSearch.length < 2) {
      setUserList([]);
      return;
    }

    api
      .get(`/users/list?name=${debouncedSearch}`)
      .then((res) =>
        setUserList(res.data.filter((val: any) => val.userId != user.userId)),
      )
      .catch(() => notify.error("Error", "Failed to fetch users"));
  }, [debouncedSearch]);

  const bookSlot = useMutation({
    mutationFn: (data: BookSlot) => api.post(`/game-bookings`, data),
    onSuccess: () => {
      notify.success("Booking Request Sent", "Wait for the approval.");
      setGamePartner([]);
    },
    onError: (err: any) => {
      notify.error(
        "Error",
        err?.response?.data?.message || "Something went wrong",
      );
    },
  });

  const handleBooking = () => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
    if (!slotId) {
      notify.error("Error", "Slot is not defined");
      return;
    }
    if (gamePartner.length < min) {
      notify.error("Error", "Minimum players not selected");
      return;
    }
    const payload: BookSlot = {
      userIds: gamePartner.map((val) => val.userId),
      slotId: Number.parseInt(slotId),
      requestedBy: user.userId,
    };
    console.log(payload);
    bookSlot.mutateAsync(payload);
  };

  const handleRemoveGamePartner = (userId: number) => {
    if (userId === user?.userId) {
      notify.error("Error", "Can not remove your self from game");
      return;
    }
    setGamePartner(gamePartner.filter((val) => val.userId != userId));
  };

  return (
    <div className="">
      <Input
        placeholder="Search users..."
        value={search}
        className="bg-white"
        onChange={(e) => setSearch(e.target.value)}
      />

      {userList.map((user) => (
        <Card
          key={user.userId}
          className="p-3 flex flex-row justify-between items-center bg-white my-2"
        >
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Button
            className="cursor-pointer"
            onClick={() => {
              if (gamePartner.length + 1 > max) {
                notify.error("Error", "Maximum player reached");
                return;
              }
              if (gamePartner.some((val) => val.userId === user.userId)) {
                notify.error("Error", "Users has been already added");
                return;
              }
              setGamePartner([...gamePartner, user]);
            }}
          >
            Add
          </Button>
        </Card>
      ))}

      {gamePartner.length > 0 && (
        <>
          <h3 className="font-bold text-lg">Selected Users</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {gamePartner.map((u) => (
              <Card key={u.userId} className="p-2 bg-gray-100 flex">
                <Button
                  className=""
                  onClick={() => handleRemoveGamePartner(u.userId)}
                >
                  {u.name}
                </Button>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => handleBooking()}
            disabled={bookSlot.isPending ? true : false}
            className="bg-black text-white mt-2"
          >
            {bookSlot.isPending ? "Booking..." : "Book slot"}
          </Button>
        </>
      )}
    </div>
  );
}
