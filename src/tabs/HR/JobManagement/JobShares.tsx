import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./datatable";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DateOptions } from "./ListJobs";
import { notify } from "@/components/custom/Notification";

interface IShareRes {
  logId: number;
  recipientEmail: string;
  sharedAt: string;
  sharedBy: SharedBy;
  status: string;
}

interface SharedBy {
  email: string;
  name: string;
  userId: number;
}

export default function JobShares() {
  const { jobId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sharedLog", jobId],
    queryFn: () => api.get("/job-shared/job/" + jobId).then((res) => res.data),
  });

  const statusChange = useMutation({
    mutationFn: (data: any) => {
      return api
        .patch(`/job-shared/${data.id}?status=${data.status}`)
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success", "Status changed");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
      return;
    },
  });

  const handleStatusChange = async (id: number, status: string) => {
    await statusChange.mutateAsync({ id, status });
  };

  const columns: ColumnDef<IShareRes>[] = [
    {
      accessorKey: "sharedBy.name",
      header: "Shared By",
    },
    {
      accessorKey: "recipientEmail",
      header: "Shared To",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 items-center">
            <div className="">{row.original.status}</div>
            <Select
              onValueChange={(value) => {
                handleStatusChange(row.original.logId, value);
              }}
              defaultValue={row.original.status}
              disabled={statusChange.isPending ? true : false}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="bg-white text-black">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="SELECTED">Selected</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: "sharedAt",
      header: "Shared At",
      cell: ({ row }) => {
        return (
          <div className="">
            {new Date(row.original.sharedAt).toLocaleDateString(
              undefined,
              DateOptions,
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Card className="bg-white p-5 md:p-10 border-0 shadow-md">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        Job Shares
      </h2>
      <DataTable
        columns={columns}
        data={data}
        searchOn="sharedBy.name"
        addButton={false}
        addButtonNav=""
      />
    </Card>
  );
}
