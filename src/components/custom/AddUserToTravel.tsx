import { useMutation } from "@tanstack/react-query";
import { notify } from "./Notification";
import api from "@/api/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useDebounce } from "@/hook/DebounceHoot";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useForm } from "react-hook-form";
import { Card } from "../ui/card";

export interface IUserList {
  email: string;
  name: string;
  userId: number;
}

interface IAddTravelingUserReq {
  travelId: number;
  users: User[];
}

interface User {
  userId: number;
  travelBalance: number;
}

export default function AddUserToTravel() {
  const { travelId } = useParams();

  const [userList, setUserList] = useState<IUserList[]>([]);
  const [search, setSearch] = useState("");

  const [userName, setUserName] = useState<IUserList[]>([]);
  const [travelingUsers, setTravelingUsers] = useState<User[]>([]);

  const debounse = useDebounce(search, 500);

  const handleSearch = async (query: any) => {
    if (!query) {
      return;
    }

    if (search.length > 1) {
      try {
        const res = await api
          .get("/users/list" + `?name=${search}`)
          .then((res) => res.data);
        setUserList(res);
      } catch (error: any) {
        console.error(error.message);
      }
    } else {
      setUserList([]);
    }
    return;
  };

  useEffect(() => {
    handleSearch(debounse);
  }, [search]);

  const travelingUser = useMutation({
    mutationFn: (data) => {
      return api.post(`/travel/traveling-user`, data).then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success", "User added into the travel");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.message);
      console.error(error.cause);
      return;
    },
  });

  return (
    <div className="">
      <div className="col-span-2">
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
                    <AddTravelingUserAction
                      travelingUsers={travelingUsers}
                      user={item}
                      setTravelingUsers={setTravelingUsers}
                      key={item.userId}
                    />
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
        <div className="grid grid-cols-1 md:grid-cols-2">
          {travelingUsers.map((item) => (
            <Card
              className="p-2 md:p-5 border-0 shadow-md bg-gray-300"
              key={item.userId}
            >
              <p className="text-xl font-bold">
                {userList.find((data) => data.userId === item.userId)?.name}
              </p>
              <p className="font-semibold text-gray-700">
                Balance: {item.travelBalance}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

const AddTravelingUserAction = ({
  travelingUsers,
  user,
  setTravelingUsers,
}: {
  travelingUsers: User[];
  user: IUserList;
  setTravelingUsers: Dispatch<SetStateAction<User[]>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({ values: { userId: user.userId, travelBalance: 0 } });

  const handleAddUser = (data: User) => {
    if (travelingUsers.some((val) => val.userId === data.userId)) {
      notify.info("User is already added");
      return;
    }
    setTravelingUsers([...travelingUsers, data]);
    console.log([...travelingUsers, data]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-white">
        <form onSubmit={handleSubmit(handleAddUser)}>
          <DialogHeader>
            <DialogTitle>Add Traveling User</DialogTitle>
            <DialogDescription>Add user to travel</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label htmlFor={`balance-${user.userId}`}>Travel Balance</label>
            <Input
              id={`balance-${user.userId}`}
              type="number"
              {...register("travelBalance", {
                required: "Travel balance is required",
              })}
              min={0}
              defaultValue={0}
            />
            {errors.travelBalance && (
              <p className="text-red-500 text-sm">
                {errors.travelBalance.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
