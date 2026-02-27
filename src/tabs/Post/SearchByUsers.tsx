import api from "@/api/api";
import type { IUserList } from "@/components/custom/AddUserToTravel";
import { notify } from "@/components/custom/Notification";
import { useDebounce } from "@/hook/DebounceHoot";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ListAllPost from "./ListAllPost";


export default function SearchByUsers() {
  const [search, setSearch] = useState("");
  const [userList, setUserList] = useState<IUserList[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toString());

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

  const handleUserSelect = (user: IUserList) => {
    setSelectedUserId(user.userId);
    setSearch("");
    setUserList([]);
  };

  const handleClear = () => {
    setSelectedUserId(null);
    setSearch("");
    setStartDate("");
    setEndDate(new Date().toString());
  };

  const hasFilter =
    selectedUserId !== null || startDate !== "" || endDate !== "";

  return (
    <div>
      <div className="flex items-center min-w-2xl gap-4 justify-self-center">
        <Input
          placeholder="Search users..."
          value={search}
          className="bg-white"
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedUserId(null);
          }}
        />

        <Input
          type="date"
          value={startDate}
          className="bg-white"
          onChange={(e) => setStartDate(e.target.value)}
        />

        <Input
          type="date"
          value={endDate}
          className="bg-white"
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {userList.map((user) => (
        <Card
          key={user.userId}
          className="p-3 min-w-2xl flex flex-row justify-between justify-self-center items-center bg-white my-2"
        >
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <Button onClick={() => handleUserSelect(user)}>
            Select
          </Button>
        </Card>
      ))}

      {!hasFilter ? (
        <ListAllPost myPost={false} deletedPost={false} />
      ) : (
        <ListAllPost
          myPost={false}
          deletedPost={false}
          userIdFilter={selectedUserId}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}