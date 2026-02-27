import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";
import { notify } from "./Notification";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useDebounce } from "@/hook/DebounceHoot";
import AddTravelingUserDialog from "./AddTarvelignUserDilog";
import type { ApiError } from "@/api/axiosError";
import { useConfirm } from "@/hooks/usecontirm";

export interface IUserList {
  userId: number;
  name: string;
  email: string;
}

interface User {
  userId: number;
  name: string;
  travelBalance: number;
}

export interface ITravelingUser {
  travelBalance: number;
  travelingUserId: number;
  usedBalance: number;
  user: User;
}

export default function AddUserToTravel() {
  const { travelId } = useParams();
  const [search, setSearch] = useState("");
  const [userList, setUserList] = useState<IUserList[]>([]);
  const [travelingUsers, setTravelingUsers] = useState<User[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (search.length < 2) {
      setUserList([]);
      return;
    }

    api
      .get(`/users/list?name=${debouncedSearch}`)
      .then((res) => setUserList(res.data))
      .catch(() => notify.error("Error", "Failed to fetch users"));
  }, [debouncedSearch]);

  const addUsersMutation = useMutation({
    mutationFn: () =>
      api.post("/travel/traveling-user", {
        travelId: Number(travelId),
        users: travelingUsers,
      }),
    onSuccess: () => {
      notify.success("Success", "Users added to travel");
      setTravelingUsers([]);
    },
    onError: (err: any) => {
      notify.error(
        "Error",
        err?.response?.data?.message || "Something went wrong",
      );
    },
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={search}
        className="bg-white"
        onChange={(e) => setSearch(e.target.value)}
      />

      {userList.map((user) => (
        <Card
          key={user.userId}
          className="p-3 flex flex-row justify-between items-center bg-white "
        >
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <AddTravelingUserDialog
            user={user}
            travelingUsers={travelingUsers}
            setTravelingUsers={setTravelingUsers}
          />
        </Card>
      ))}

      {travelingUsers.length > 0 && (
        <>
          <h3 className="font-bold text-lg">Selected Users</h3>

          {travelingUsers.map((u) => (
            <Card
              key={u.userId}
              className="p-2 bg-gray-100"
              onClick={() =>
                setTravelingUsers(
                  travelingUsers.filter((val) => val.userId != u.userId),
                )
              }
            >
              {u.name} — Balance: ₹{u.travelBalance}
            </Card>
          ))}

          <Button
            onClick={() => addUsersMutation.mutate()}
            disabled={addUsersMutation.isPending}
            className="bg-black text-white"
          >
            {addUsersMutation.isPending ? "Saving..." : "Add Users to Travel"}
          </Button>
        </>
      )}
      <UpdateTravelingUsers />
    </div>
  );
}

function UpdateTravelingUsers() {
  const { travelId } = useParams();

  const {confirm, ConfirmComponent} = useConfirm();

  const [travelingUsersData, setTravelingUsersData] = useState<
    ITravelingUser[]
  >([]);

  const travelingUsers = useQuery<ITravelingUser[], ApiError>({
    queryKey: ["TravelingUsers", travelId],
    queryFn: () =>
      api.get(`/travel/traveling-user/${travelId}`).then((res) => res.data),
    enabled: !!travelId,
  });

  useEffect(() => {
    if (travelingUsers.data) setTravelingUsersData(travelingUsers.data);
  }, [travelingUsers.data]);

  const queryClient = useQueryClient();

  const updateBalance = useMutation({
    mutationFn: async ({
      travelingUserId,
      balance,
    }: {
      travelingUserId: number;
      balance: number;
    }) => {
      return api
        .patch(`/travel/traveling-user/${travelingUserId}`, {
          updatedBalance: balance,
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("User balance updated");
      if (travelId) {
        queryClient.invalidateQueries({
          queryKey: ["TravelingUsers", travelId],
        });
      }
    },
    onError: (error: any) => {
      notify.error(
        "Error",
        error.response?.data?.message || "Failed to update",
      );
      console.error(error.response);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({
      travelingUserId,
      usedBalance,
    }: {
      travelingUserId: number;
      usedBalance: number;
    }) => {
      if (usedBalance > 0) {
        notify.error(
          "Error",
          "Uesr has used some of the balance now can not be removed",
        );
        return;
      }
      const res = await confirm("Are you sure you want to remove traveling user");
      if(!res)
        return
      return api.delete(`/travel/traveling-user/${travelingUserId}`);
    },
    onSuccess: () => {
      notify.success("User removed from travel");
      if (travelId) {
        queryClient.invalidateQueries({
          queryKey: ["TravelingUsers", travelId],
        });
      }
    },
    onError: (error: any) => {
      notify.error(
        "Error",
        error.response?.data?.message || "Failed to remove user",
      );
    },
  });

  if (travelingUsers.isLoading)
    return (
      <div className="flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  if (travelingUsers.isError)
    return (
      <div className="text-red-500">
        Error: {travelingUsers.error.response?.data.message}
      </div>
    );

  return (
    <Card className="bg-white p-5 md:p-10 border-0 shadow-md grid grid-cols-3 gap-4">
      {travelingUsersData.map((item) => (
        <div className="border p-5 rounded flex gap-y-2 flex-col">
          <div className="">
            <p className="text-gray-800 text-xl">{item.user.name}</p>
          </div>
          <div className="flex gap-4 items-center">
            <label className="text-gray-500">Balance:</label>
            <Input
              type="number"
              min={0}
              value={item.travelBalance}
              onChange={(e) => {
                const newBal = Number.parseFloat(e.target.value);
                setTravelingUsersData((prev) =>
                  prev.map((v) =>
                    v.travelingUserId === item.travelingUserId
                      ? { ...v, travelBalance: newBal }
                      : v,
                  ),
                );
              }}
            />
          </div>
          <div className="text-gray-500">Used: {item.usedBalance}</div>
          <div className="flex gap-2">
            <Button
              className="bg-black text-white"
              onClick={() =>
                updateBalance.mutate({
                  travelingUserId: item.travelingUserId,
                  balance: item.travelBalance,
                })
              }
              disabled={updateBalance.isPending}
            >
              {updateBalance.isPending ? "Updating..." : "Update"}
            </Button>
            <Button
              className="bg-red-400 text-white border-red-700"
              onClick={() => removeMutation.mutate({travelingUserId: item.travelingUserId, usedBalance: item.usedBalance})}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </div>
        </div>
      ))}
      {ConfirmComponent}
    </Card>
  );
}
