import api from "@/api/api";
import { RouteList } from "@/api/routes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { notify } from "./Notification";

export interface ITravelingUser {
  travelBalance: number;
  travelingUserId: number;
  usedBalance: number;
  user: User;
}

interface User {
  email: string;
  name: string;
  userId: number;
}

export default function UpdateTravelingUser() {
  const { travelId } = useParams();

  const [travelingUsers, setTravelingUsers] = useState<ITravelingUser[]>([]);

  const { isLoading, data, isError, error } = useQuery({
    queryKey: ["travelingUsersData"],
    queryFn: () =>
      api
        .get(RouteList.travelingUsers + `/${travelId}`, {
          withCredentials: true,
        })
        .then((res) => res.data),
  });

  useEffect(() => {
    setTravelingUsers(data);
  }, [travelingUsers]);

  const RemoveUserFormTravelList = (travelingUserId: number) => {
    try {
      const con = confirm("Are you sure you want to remove traveling user");
      if (con === true) {
        setTravelingUsers(
          travelingUsers.filter(
            (val) => val.travelingUserId != travelingUserId,
          ),
        );
        api.delete(RouteList.travelingUsers + `/${travelingUserId}`, {
          withCredentials: true,
        });
        notify.success("Traveling user removed");
      }
    } catch (error: any) {
      console.error(error.message);
      notify.error("Error", error.message);
    }
  };

  if (isLoading) return <div className="">Loading...</div>;

  if (isError) return <div className="">Error: {error.message}</div>;
  return (
    <div className="">
      {travelingUsers?.length > 0 ? (
        <div className="grid grid-cols-2 md-grid:cols-2 p-2 gap-4">
          {travelingUsers.map((item) => (
            <div
              className="p-4 rounded-md bg-linear-150 from-sky-800 to-sky-400 shadow-md border-0"
              key={item.travelingUserId}
            >
              <p className="font-semibold text-white mb-2">{item.user.name}</p>
              <p className="text-gray-200 font-mono mb-2">{item.user.email}</p>
              <hr />
              <p className="text-gray-200 font-mono my-2">Travel balance</p>
              <Input
                type="number"
                min={0}
                className="bg-white"
                defaultValue={item.travelBalance}
              />
              <p className="text-gray-200 font-mono my-2">Used balance</p>
              <Input
                type="number"
                min={0}
                className="bg-white"
                defaultValue={item.usedBalance}
              />
              <div className="flex gap-4">
                <Button
                  className="bg-blue-700 text-white cursor-pointer mt-2 hover:bg-blue-900 duration-200"
                  // onClick={() => AddUserToTravelList(item)}
                >
                  Save
                </Button>
                <Button
                  className="bg-red-700 text-white cursor-pointer mt-2 hover:bg-red-900 duration-200"
                  onClick={() => RemoveUserFormTravelList(item.travelingUserId)}
                >
                  Remove
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
    </div>
  );
}
