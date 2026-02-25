import api from "@/api/api";
import type { IUserList } from "@/components/custom/AddUserToTravel";
import { notify } from "@/components/custom/Notification";
import { useDebounce } from "@/hook/DebounceHoot";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SearchByUsers() {
  const [search, setSearch] = useState("");
  const [userList, setUserList] = useState<IUserList[]>([]);
  const navigate = useNavigate();

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

  const handleSearch = (userId: number) => {
    setUserList([]);
    setSearch("");
    navigate(`./${userId}`);
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

          <Button onClick={() => handleSearch(user.userId)}>View Posts</Button>
        </Card>
      ))}

      <Outlet />
    </div>
  );
}
