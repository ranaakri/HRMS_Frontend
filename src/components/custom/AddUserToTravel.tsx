import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useDebounce } from "@/hook/DebounceHoot";
import api from "@/api/api";
import { RouteList } from "@/api/routes";
import { Button } from "../ui/button";
import UpdateTravelingUser from "./UpdateTravelingUser";
import { notify } from "./Notification";

export interface IUserList {
  email: string;
  name: string;
  userId: number;
}

export default function AddUserToTravel() {
  const [search, setSearch] = useState<string>();
  const [userList, setUserList] = useState<IUserList[]>([]);
  const [selectedUsers, setSelecteedUsers] = useState<IUserList[]>([]);

  const debounse = useDebounce(search, 500);

  const handleSearch = async (query: any) => {
    if (!query) {
      console.log("loading");
      return;
    }

    try {
      const res = await api
        .get(RouteList.usersList + `?name=${search}`, { withCredentials: true })
        .then((res) => res.data);
      console.log(res);
      setUserList(res);
    } catch (error: any) {
      console.error(error.message);
    }
    return;
  };

  const handleUserAdd = (item: IUserList) => {
    if(selectedUsers.includes(item)){
        notify.error("Users is already added");
    }else{
        setSelecteedUsers([...selectedUsers, item]);
    }
  };

  //Update this functoin logic
  const AddUserToTravelList = (item: number) => {
    setSelecteedUsers(selectedUsers.filter((user) => user.userId != item));
  };

  //Update this functions
  const RemoveUserFormTravelList = (item: number) => {
    setSelecteedUsers(selectedUsers.filter((user) => user.userId != item));
  };

  useEffect(() => {
    handleSearch(debounse);
  }, [search]);

  return (
    <div className="">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 ">
        Add User to Travel
      </h2>
      <div className="">
        <Input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>
      <div className="">
        {userList.length > 0 ? (
          <div className="max-h-50 overflow-auto">
            {userList.map((item) => (
              <div
                className="m-2 border p-2 rounded-md grid grid-cols-2"
                key={item.userId}
              >
                <div className="">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500 font-mono">{item.email}</p>
                </div>
                <div className="flex justify-end items-center">
                  <Button
                    className="bg-blue-500 text-white cursor-pointer"
                    onClick={() => handleUserAdd(item)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500 m-5">
            No Data
          </div>
        )}
        <div className="p-2 mt-4">
          {selectedUsers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedUsers.map((item) => (
                <div className="p-4 rounded-md bg-linear-150 from-sky-800 to-sky-400 shadow-md border-0">
                  <p className="font-semibold text-white mb-2">{item.name}</p>
                  <p className="text-gray-200 font-mono mb-2">{item.email}</p>
                  <Input
                    type="number"
                    min={0}
                    className="bg-white"
                    defaultValue={0}
                  />
                  <div className="flex gap-4">
                    <Button
                      className="bg-blue-500 text-white cursor-pointer mt-2 hover:bg-blue-900 duration-200"
                      onClick={() => AddUserToTravelList(item.userId)}
                    >
                      Save
                    </Button>
                    <Button
                      className="bg-red-700 text-white cursor-pointer mt-2 hover:bg-red-900 duration-200"
                      onClick={() => RemoveUserFormTravelList(item.userId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 ">
        Add User to Travel
      </h2>
      <div className="">
        <UpdateTravelingUser />
      </div>
    </div>
  );
}
