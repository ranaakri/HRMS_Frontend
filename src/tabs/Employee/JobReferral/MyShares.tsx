import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import type { JobResponse } from "@/tabs/HR/JobManagement/CreateJob";
import { DataTable } from "@/tabs/HR/JobManagement/datatable";
import { DateOptions } from "@/tabs/HR/JobManagement/ListJobs";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
export interface IJobSharesResponse {
  logId: number;
  recipientEmail: string;
  status: string;
  sharedAt: string;
  sharedBy: SharedBy;
  job: JobResponse;
}

export interface SharedBy {
  userId: number;
  name: string;
  email: string;
}

export default function MyShares() {
  const { user } = useAuth();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["MyShares", user?.userId],
    queryFn: () =>
      api
        .get(`/job-shared/user/${user?.userId}`, { withCredentials: true })
        .then((res) => res.data),
    enabled: !!user?.userId
  });

  const column: ColumnDef<IJobSharesResponse>[] = [
    {
      accessorKey: "job.title",
      header: "Job Title",
    },
    {
      accessorKey: "job.status",
      header: "Job status",
    },
    {
      accessorKey: "recipientEmail",
      header: "Recipient",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "sharedAt",
      header: "Shared at",
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
    <Card className="p-5 md:p-10 border-0 shadow-md bg-white">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        My Shares
      </h2>
      <DataTable
        columns={column}
        data={data}
        addButton={false}
        addButtonNav=""
        searchOn="recipientEmail"
      />
    </Card>
  );
}
