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

export default function BookSlot() {
  const { gameId } = useParams();
  const { slotId } = useParams();

  const [bookings, setBooking] = useState<BookingResponse[]>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => api.get(`/game/${gameId}`).then((res) => res.data),
  });

  const bookingList = useQuery({
    queryKey: ["bookingList", slotId],
    queryFn: async () => {
      const data = await api
        .get(`/game/bookings/${slotId}`)
        .then((res) => res.data);
      setBooking(data);
      return data;
    },
    enabled: !!slotId,
  });

  if (isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;
  return (
    <Card className="grid grid-cols-1 md:grid-cols-3 p-2 min-h-full bg-white">
      <div className="col-span-2">
        <div className="flex flex-col gap-2 border-r p-5 min-h-full">
          <GamesCard game={data} active={false} />
          <AddUserToGame min={data.minPlayers} max={data.maxPlayers} />
        </div>
      </div>
      <div className="">
        {bookingList.isLoading ? (
          <div className="">Loading...</div>
        ) : bookingList.isError ? (
          <div className="">Error: {bookingList.error.message}</div>
        ) : (
          <div className="">
            <div className="text-gray-500 text-xl mb-2 overflow-auto">Bookings</div>
            {bookings.length > 0 ? (
              bookings.map((item, index) => (
                <div
                  className="flex items-center bg-black text-white shadow-md rounded-md p-2 m-2"
                  key={item.requestId}
                >
                  <p className="mr-5">{index+1}.</p>
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

function GamesCard({ game, active }: { game: Games; active: boolean }) {
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
    setGamePartner([
      ...gamePartner,
      {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    ]);
  }, [user]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }

    if (search.length < 2) {
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
    mutationFn: (data: BookSlot) => api.post(`/game/bookings`, data),
    onSuccess: () => {
      notify.success("Booking Confirmed", "Wait for the approval.");
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
              <Card key={u.userId} className="p-2 bg-gray-100">
                {u.name}
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
