import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import type { JobResponse } from "@/tabs/HR/JobManagement/CreateJob";
import { DataTable } from "@/tabs/HR/JobManagement/datatable";
import { DateOptions } from "@/tabs/HR/JobManagement/ListJobs";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
export interface IJobReferralRes {
  candidateEmail: string;
  candidateName: string;
  createdAt: string;
  cvPath: string;
  referralId: number;
  referralNote: string;
  referredBy: ReferredBy;
  status: string;
  job: JobResponse;
}

export interface ReferredBy {
  email: string;
  name: string;
  userId: number;
}

export default function MyReferrals() {
  const { user } = useAuth();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["MyShares"],
    queryFn: () =>
      api
        .get(`/referral/user/${user?.userId}`, { withCredentials: true })
        .then((res) => res.data),
  });

  const column: ColumnDef<IJobReferralRes>[] = [
    {
      accessorKey: "job.title",
      header: "Job Title",
    },
    {
      accessorKey: "job.status",
      header: "Job status",
    },
    {
      accessorKey: "candidateName",
      header: "Name",
    },
    {
      accessorKey: "candidateEmail",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "createdAt",
      header: "Shared at",
      cell: ({ row }) => {
        return (
          <div className="">
            {new Date(row.original.createdAt).toLocaleDateString(
              undefined,
              DateOptions,
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "cvPath",
      cell: ({ row }) => {
        return (
          <a
            href={row.original.cvPath}
            target="_blank"
            className="p-2 px-4 rounded-md underline"
          >
            View
          </a>
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
        My Referrals
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
