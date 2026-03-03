import api from "@/api/api";
import type { ApiError } from "@/api/axiosError";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hook/DebounceHoot";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  designation: string;
  joiningDate: string;
  birthdate: string;
  departmentId: number;
  roleId: number;
  assignUnderId: number;
  birthDate: string;
}

interface IRoles {
  roleId: number;
  name: string;
}

interface IDepartments {
  departmentId: number;
  name: string;
  description: string;
}

export interface IUserList {
  userId: number;
  name: string;
  email: string;
}

function generateSecurePassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[].,:;<>?|";
  let result = "";
  const randomArray = new Uint32Array(length);

  crypto.getRandomValues(randomArray);

  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });

  return result;
}

export default function AddUser() {
  const [assignedUnder, setAssignedUnder] = useState<number | null>(null);

  const departmentQuery = useQuery<IDepartments[], ApiError>({
    queryKey: ["fetchAllDepartments"],
    queryFn: () => api.get(`/department/list`).then((res) => res.data),
  });

  const rolesQuery = useQuery<IRoles[], ApiError>({
    queryKey: ["fetchAllRoles"],
    queryFn: () => api.get(`/role/list`).then((res) => res.data),
  });

  const designationQuery = useQuery<string[], ApiError>({
    queryKey: ["fetchAllDesignations"],
    queryFn: () => api.get(`/users/designations`).then((res) => res.data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUser>();

  const updateMutation = useMutation({
    mutationFn: (data: CreateUser) => {
      data.birthdate = new Date(data.birthdate).toISOString();
      data.joiningDate = new Date(data.joiningDate).toISOString();
      return api.post(`/users`, data);
    },
    onSuccess: () => {
      notify.success("User created successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const onSubmit = (data: CreateUser) => {
    if (assignedUnder === null) {
      notify.error("Error", "Please select a user to assign under");
      return;
    }
    updateMutation.mutate({
      ...data,
      assignUnderId: assignedUnder,
      password: generateSecurePassword(),
    });
  };

  return (
    <Card className="bg-white p-5 md:p-10 rounded-md shadow-md">
      <h3 className="text-gray-500 text-2xl">Create User Profile</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="">
          <label htmlFor="name" className="text-gray-500 mb-4">
            Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div className="">
          <label htmlFor="email" className="text-gray-500 mb-4">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="">
          <label htmlFor="designation" className="text-gray-500 mb-4">
            Designation
          </label>
          <select
            id="designation"
            {...register("designation", {
              required: "Designation is required",
            })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Designation</option>
            {designationQuery.data?.map((deg) => (
              <option key={deg} value={deg.toString()}>
                {deg}
              </option>
            ))}
          </select>
        </div>

        <div className="">
          <label htmlFor="birthdate" className="text-gray-500 mb-4">
            Birthdate
          </label>
          <Input
            type="date"
            id="birthdate"
            {...register("birthdate", { required: "Birthdate is required" })}
          />
        </div>

        <div className="">
          <label htmlFor="joiningDate" className="text-gray-500 mb-4">
            Joining Date
          </label>
          <Input
            type="date"
            id="joiningDate"
            {...register("joiningDate", {
              required: "Joining date is required",
            })}
          />
        </div>

        <div className="">
          <label htmlFor="department" className="text-gray-500 mb-4">
            Department
          </label>
          <select
            id="department"
            {...register("departmentId", {
              valueAsNumber: true,
              required: "Department is required",
            })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Department</option>
            {departmentQuery.data?.map((dep) => (
              <option key={dep.departmentId} value={dep.departmentId}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>

        <div className="">
          <label htmlFor="role" className="text-gray-500 mb-4">
            Role
          </label>
          <select
            id="role"
            {...register("roleId", {
              valueAsNumber: true,
              required: "Role is required",
            })}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Role</option>
            {rolesQuery.data?.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <div className="text-gray-500 items-center justify-center text-xl mb-2">Assign Under</div>
          <AddAssignedUnder setAssignedUnder={setAssignedUnder} />
        </div>
        <div className="">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </Card>
  );
}

function AddAssignedUnder({
  setAssignedUnder,
}: {
  readonly setAssignedUnder: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const [search, setSearch] = useState("");
  const [userList, setUserList] = useState<IUserList[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserList | null>(null);

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

          <Button
            className="bg-black text-white"
            onClick={() => {
              setAssignedUnder(user.userId);
              setSelectedUser(user);
              setSearch("")
            }}
            type="button"
          >
            Select
          </Button>
        </Card>
      ))}
      {selectedUser && (
        <div className="">
          
          <div className="flex p-4 gap-4 border-0 mt-4 bg-gray-100 rounded-md">
            <p>{selectedUser.name}</p>
            <p>{selectedUser.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}
