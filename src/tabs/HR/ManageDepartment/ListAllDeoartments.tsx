import api from "@/api/api";
import type { ApiError } from "@/api/axiosError";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/hooks/usecontirm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface IDepartments {
  departmentId: number;
  name: string;
  description: string;
}

interface IAddDepartment {
  name: string;
  description: string;
}

export default function ListAllDepartments() {
  const [search, setSearch] = useState<string>("");
  const [departmentList, setDepartment] = useState<IDepartments[]>([]);

  const departmentQuery = useQuery<IDepartments[], ApiError>({
    queryKey: ["fetchAllDepartments"],
    queryFn: () => api.get(`/department/list`).then((res) => res.data),
  });

  useEffect(() => {
    if (search.length > 0) {
      setDepartment(
        departmentList.filter((item) =>
          item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
        ),
      );
    } else {
      if (departmentQuery.data) setDepartment(departmentQuery.data);
    }
  }, [search, departmentQuery.data]);

  const deleteDepartment = useMutation({
    mutationFn: async (departmentId: number) => {
      return api.delete(`/department/${departmentId}`).then((res) => res.data);
    },
    onSuccess: (_, departmentId) => {
      setDepartment(
        departmentList.filter((item) => item.departmentId !== departmentId),
      );
      notify.success("Department deleted successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const updateDepartment = useMutation({
    mutationFn: async (data: IDepartments) => {
      return api
        .put(`/department/${data.departmentId}`, data)
        .then((res) => res.data);
    },
    onSuccess: (_, data) => {
      setDepartment(
        departmentList.map((item) =>
          item.departmentId === data.departmentId ? data : item,
        ),
      );
      notify.success("Department updated successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const addDepartment = useMutation({
    mutationFn: async (data: IAddDepartment) => {
      return api.post(`/department`, data).then((res) => res.data);
    },
    onSuccess: (data) => {
      notify.success("Department added successfully");
      setDepartment([...departmentList, data]);
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  if (departmentQuery.isSuccess) {
    return (
      <Card className="p-6 md:p-10 bg-white rounded-xl shadow-sm border-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <Input
            type="text"
              placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs bg-gray-50"
          />
            <AddDepartment addDepartment={addDepartment} />
          </div>
        </div>
        <div className="grid gap-4">
          {departmentList.map((item) => (
            <DepartmentCommponent key={item.departmentId} item={item} deleteDepartment={deleteDepartment} updateDepartment={updateDepartment} />
          ))}
        </div>
      </Card>
    );
  }
}

function DepartmentCommponent({
  item,
  deleteDepartment,
  updateDepartment,
}: {
  item: IDepartments;
  deleteDepartment: any;
  updateDepartment: any;
}) {
  const [isUpdate, setUpdate] = useState(false);
  const [data, setData] = useState<IDepartments>(item);

  const { confirm, ConfirmComponent } = useConfirm();

  const handleUpdate = () => {
    updateDepartment.mutate(data);
    setUpdate(false);
  };

  const handleDelete = async () => {
    if (await confirm("Are you sure you want to delete this department?"))
      deleteDepartment.mutate(item.departmentId);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="w-full">
        {isUpdate ? (
          <div className="space-y-2 w-full">
            <Input
              type="text"
              placeholder="Name"
              value={data?.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="bg-white"
            />
            <Input
              type="text"
              placeholder="Description"
              value={data?.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="bg-white"
            />
          </div>
        ) : (
          <div className="">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-gray-500 text-sm">{item.description}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex gap-2">
          <Button 
            variant={isUpdate ? "outline" : "secondary"} 
            size="sm" 
            onClick={() => setUpdate(!isUpdate)}
          >
            {isUpdate ? "Cancel" : "Edit"}
          </Button>
          {isUpdate && <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdate}>Save</Button>}
        </div>
        {!isUpdate && (
          <Button variant="destructive" className="text-red-500" size="sm" onClick={() => handleDelete()}>Delete</Button>
        )}
      </div>
      {ConfirmComponent}
    </div>
  );
}

function AddDepartment({ addDepartment }: { addDepartment: any }) {
  const [name, setDepartmentName] = useState<string>("");
  const [description, setDepartmentDescription] = useState<string>("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-gray-800">+ Add Department</Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle>Add new Department</DialogTitle>
          </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
          <Input
            id="name"
              placeholder="e.g. Engineering"
            required
            onChange={(e) => setDepartmentName(e.target.value)}
          />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descrption">Description</Label>
          <Input
            id="descrption"
              placeholder="Brief description of the department"
            required
            onChange={(e) => setDepartmentDescription(e.target.value)}
          />
          </div>
        </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
            className="bg-black text-white"
              onClick={async () =>
                await addDepartment.mutateAsync({
                  name: name,
                  description: description,
                })
              }
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
