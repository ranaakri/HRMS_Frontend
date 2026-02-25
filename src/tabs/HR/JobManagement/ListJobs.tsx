import { Card } from "@/components/ui/card";
import { DataTable } from "./datatable";
import type { ColumnDef } from "@tanstack/react-table";
import type { JobResponse } from "./CreateJob";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiUserSharedLine } from "react-icons/ri";
import { FaEdit, FaRegEye, FaShare } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";

export const DateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
};

export default function ListJobs() {
  const columns: ColumnDef<JobResponse>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "lastApplicationDate",
      header: "Last Application Date",
      cell: ({ row }) => {
        return (
          <div className="">
            {new Date(row.original.lastApplicationDate).toLocaleDateString(
              undefined,
              DateOptions,
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
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
      header: "Action",
      cell: ({ row }) => {
        const rowdata = row.original;
        return (
          <div className="flex justify-center items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><IoMdMenu /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <FaRegEye />
                    <Link to={`view/${rowdata.jobId}`}>View</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem variant={"default"}>
                    <FaEdit />
                    <Link to={`update/${rowdata.jobId}`}>Update</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FaShare />
                    <Link to={`shares/${rowdata.jobId}`}>Shares</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RiUserSharedLine />
                    <Link to={`referrals/${rowdata.jobId}`}>Referrals</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["listOfJobs"],
    queryFn: () =>
      api
        .get<JobResponse[]>(`/job`, { withCredentials: true })
        .then((res) => res.data),
  });

  if (isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Card className="border-0 bg-white p-5 md:p-10">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        List Jobs
      </h2>
      <div className="flex">
        <Link to={"share"} className="p-2 px-4 bg-black text-white rounded-md flex gap-2 items-center justify-center">
          <FaShare /> Share a Job
        </Link>
      </div>
      {data ? (
        <DataTable
          columns={columns}
          data={data}
          searchOn="title"
          addButton={true}
          addButtonNav="add"
        />
      ) : (
        <div className="flex items-center justify-center">No Job postings</div>
      )}
    </Card>
  );
}
