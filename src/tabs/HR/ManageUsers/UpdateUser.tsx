import api from "@/api/api";
import type { ApiError } from "@/api/axiosError";
import { notify } from "@/components/custom/Notification";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

export interface IUser {
  active: boolean;
  birthdate: string;
  department: Department;
  designation: string;
  email: string;
  joiningDate: string;
  name: string;
  profileUrl: string;
  role: Role;
  userId: number;
}

interface Department {
  departmentId: number;
  name: string;
}

interface Role {
  name: string;
  roleId: number;
}

interface UpdateUser {
  name: string;
  email: string;
  designation: string;
  birthdate: string;
  joiningDate: string;
  updatedAt: string;
  roleId: number;
  departmentId: number;
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

export default function UpdateUser() {
  const { userId } = useParams();

  const profileQuery = useQuery<IUser, ApiError>({
    queryKey: ["fetchUserProfile", userId],
    queryFn: () => api.get(`/users/id/${userId}`).then((res) => res.data),
    enabled: !!userId,
  });

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
    reset,
    formState: { errors },
  } = useForm<UpdateUser>();

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        name: profileQuery.data.name,
        email: profileQuery.data.email,
        designation: profileQuery.data.designation,
        birthdate: profileQuery.data.birthdate
          ? new Date(profileQuery.data.birthdate).toISOString().split("T")[0]
          : "",
        joiningDate: profileQuery.data.joiningDate
          ? new Date(profileQuery.data.joiningDate).toISOString().split("T")[0]
          : "",
        roleId: profileQuery.data.role.roleId,
        departmentId: profileQuery.data.department.departmentId,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [profileQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUser) => {
      data.birthdate = new Date(data.birthdate).toISOString();
      data.joiningDate = new Date(data.joiningDate).toISOString();
      return api.put(`/users/${userId}`, data);
    },
    onSuccess: () => {
      notify.success("User updated successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const onSubmit = (data: UpdateUser) => {
    updateMutation.mutate({
      ...data,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Card className="bg-white p-5 md:p-10 rounded-md shadow-md">
      <h3 className="text-gray-500 text-2xl">Update User Profile</h3>
      <div className="flex justify-start items-center">
        <img
          src={profileQuery.data?.profileUrl}
          className="w-25 h-25 rounded-full object-cover"
        />
      </div>
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
        <div className=""></div>
        <div className="">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>
    </Card>
  );
}
