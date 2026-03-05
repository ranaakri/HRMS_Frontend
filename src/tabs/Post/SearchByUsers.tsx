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
  const [tag, setTag] = useState("");
  const [appliedTag, setAppliedTag] = useState<string | null>(null);

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
    setTag("");
    setAppliedTag(null);
  };

  const handleTagSearch = () => {
    if (!tag || tag.trim().length <= 0) {
      notify.error("Error", "Tags can not be empty");
      return;
    }
    if (tag.length < 2) return;
    if (tag && !tag.startsWith("#")) {
      notify.error("Error", "Tags must start with #");
      return;
    }
    setAppliedTag(tag);
  };

  const hasFilter =
    selectedUserId !== null ||
    startDate !== "" ||
    endDate !== "" ||
    appliedTag !== null;

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

        <Input
          placeholder="Search by tag..."
          value={tag}
          className="bg-white"
          onChange={(e) => setTag(e.target.value)}
        />

        <Button onClick={handleTagSearch}>Search Tag</Button>

        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {userList.map((user) => (
        <Card
          key={user.userId}
          className="p-3 flex flex-row justify-between items-center bg-white border-gray-100 hover:border-black transition-all min-w-3xl mt-2 justify-self-center"
        >
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="cursor-pointer hover:bg-black hover:text-white"
            onClick={() => handleUserSelect(user)}
          >
            Select
          </Button>
        </Card>
      ))}

      {hasFilter ? (
        <ListAllPost
          myPost={false}
          deletedPost={false}
          userIdFilter={selectedUserId}
          startDate={startDate}
          tags={appliedTag}
          endDate={endDate}
        />
      ) : (
        <ListAllPost myPost={false} deletedPost={false} />
      )}
    </div>
  );
}
