import api from "@/api/api";
import type { ApiError } from "@/api/axiosError";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import InfiniteScroll from "@/tabs/Post/InfiniteScroll";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const BirthDateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "long",
  day: "numeric",
};

interface Users {
  userId: number;
  name: string;
  email: string;
  designation: string;
  birthdate: string;
  joiningDate: string;
  profileUrl: string;
  active: boolean;
}

interface IDepartments {
  departmentId: number;
  name: string;
  description: string;
}

export default function ListAllUsers() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [usersList, setUserList] = useState<Users[]>([]);
  const [department, setDepartment] = useState<number | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(0);
    setUserList([]);
    setHasMore(true);
  }, [department]);

  const usersListQuery = useQuery<Users[]>({
    queryKey: ["ListAllUsers", department, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("pageSize", "10");
      if (department !== 0 && department !== null) {
        params.append("department", department.toString());
      }
      return api.get(`/users/list/all?${params}`).then((res) => res.data) || [];
    },
  });

  const departmentQuery = useQuery<IDepartments[], ApiError>({
    queryKey: ["fetchAllDepartments"],
    queryFn: () => api.get(`/department/list`).then((res) => res.data),
  });

  const userStatus = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: number;
      status: boolean;
    }) => {
      return await api
        .patch(`/users/user/${userId}/status/${status}`)
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("User status updated");
      queryClient.invalidateQueries({
        queryKey: ["ListAllUsers"],
      });
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
      return;
    },
  });

  useEffect(() => {
    if (!usersListQuery.data) return;
    if (usersListQuery.data.length < 10) setHasMore(false);
    
    setUserList((prev) => (page === 0 ? usersListQuery.data : [...prev, ...usersListQuery.data]));
  }, [usersListQuery.data, page]);

  const loadMore = () => {
    if (!usersListQuery.isFetching && hasMore) {
      setPage((prev: any) => prev + 1);
    }
  };

  if (usersListQuery.isError)
    return (
      <div className="text-red-500">Error: {usersListQuery.error.message}</div>
    );

  if (usersListQuery.data || usersList.length > 0) {
    return (
      <Card className="md:p-10 p-5 bg-white rounded-md shadow-md border-0">
        <div className="felx">
          <Link to={"add"} className="justify-self-end text-white bg-black rounded-md p-2 px-4">+ Add User</Link>
        </div>
        <div className="">
          <div className="">
            <label htmlFor="department" className="text-gray-500 mb-4">
              Department
            </label>
            <select
              id="department"
              className="w-full border p-2 rounded"
              value={department || "0"}
              onChange={(e) => setDepartment(Number.parseInt(e.target.value))}
            >
              <option value="0">All</option>
              {departmentQuery.data?.map((dep) => (
                <option key={dep.departmentId} value={dep.departmentId}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {usersListQuery.isLoading && page === 0 ? (
          <div className="flex items-center justify-center text-gray-500 p-10">
            Loading...
          </div>
        ) : (
        <InfiniteScroll
          data={usersList}
          hasMore={hasMore}
          isLoading={usersListQuery.isLoading}
          loadMore={loadMore}
          message="No more Users"
          renderItem={(item: Users) => (
            <div className="border p-5 my-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="flex gap-4 items-center">
                  <div className="">
                    <img
                      src={item.profileUrl}
                      className="rounded-full w-25 h-25 object-cover"
                    />
                  </div>
                  <div className="">
                    <p className="text-xl font-semibold">{item.name}</p>
                    <p className="">{item.email}</p>
                    <p className="">{item.designation}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="">
                    <p className="">
                      <b>Birth date: </b>
                      {new Date(item.birthdate).toLocaleString(
                        undefined,
                        BirthDateOptions,
                      )}
                    </p>
                    <p className="">
                      <b>Joining date: </b>
                      {new Date(item.joiningDate).toLocaleString(
                        undefined,
                        BirthDateOptions,
                      )}
                    </p>
                    <p className="">{item.active ? "Active" : "Blocked"}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-self-end gap-4">
                <Button
                  className="bg-gray-500 text-white"
                  onClick={() => navigate(`update/${item.userId}`)}
                >
                  Update
                </Button>
                {item.active ? (
                  <Button
                    className="bg-black text-white"
                    onClick={async () =>
                      await userStatus.mutateAsync({
                        userId: item.userId,
                        status: false,
                      })
                    }
                  >
                    Block
                  </Button>
                ) : (
                  <Button
                    className="bg-gray-500 text-white"
                    onClick={async () =>
                      await userStatus.mutateAsync({
                        userId: item.userId,
                        status: true,
                      })
                    }
                  >
                    Unblock
                  </Button>
                )}
              </div>
            </div>
          )}
        />)}
      </Card>
    );
  }

  return null;
}
