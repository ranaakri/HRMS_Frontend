import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/api";
import { notify } from "./Notification";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useDebounce } from "@/hook/DebounceHoot";
import AddTravelingUserDialog from "./AddTarvelignUserDilog";

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
            <Card key={u.userId} className="p-2 bg-gray-100" onClick={() => setTravelingUsers(travelingUsers.filter(val => val.userId != u.userId))}>
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
    </div>
  );
}
