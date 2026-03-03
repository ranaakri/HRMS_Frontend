import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/tabs/HR/JobManagement/datatable";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const JobsDateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export interface JobResponse {
  jobId: number;
  title: string;
  summary: string;
  jobPost: string;
  jdFilePath: string;
  lastApplicationDate: string;
  status: string;
  createdAt: string;
  hrContact: HrContact;
  cvReviewers: CvReviewer[];
}

export interface HrContact {
  userId: number;
  name: string;
  email: string;
}

export interface CvReviewer {
  userId: number;
  name: string;
  email: string;
}

const column: ColumnDef<JobResponse>[] = [
  {
    accessorKey: "title",
    header: "Job Title",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString(
        "en-US",
        JobsDateOptions,
      );
    },
  },
  {
    accessorKey: "lastApplicationDate",
    header: "Last Application Date",
    cell: ({ row }) => {
      return new Date(row.original.lastApplicationDate).toLocaleDateString(
        "en-US",
        JobsDateOptions,
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex gap-4">
          <Link
            to={"../view/" + row.original.jobId}
            className="bg-gray-500 text-white rounded p-2 px-4"
          >
            View
          </Link>
          <Link
            to={"view/" + row.original.jobId}
            className="bg-black text-white rounded p-2 px-4"
          >
            Review CV
          </Link>
        </div>
      );
    },
  },
];

export default function CvReviews() {
  const { user } = useAuth();

  const [data, setData] = useState<JobResponse[]>([]);

  const jobsForCvReview = useQuery<JobResponse[]>({
    queryKey: ["jobsForCvReview", user?.userId],
    queryFn: () =>
      api
        .get(`/referral/cv-review/user/${user?.userId}`)
        .then((res) => res.data),
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (jobsForCvReview.data) {
      setData(jobsForCvReview.data);
    }
  }, [jobsForCvReview.data]);

  if (jobsForCvReview.isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (jobsForCvReview.isError)
    return (
      <div className="text-red-500">Error: {jobsForCvReview.error.message}</div>
    );

  if (jobsForCvReview.isSuccess) {
    return (
      <Card className="p-5 md:p-10 border-0 shadow-md bg-white">
        <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
          Open Jobs For Cv Review
        </h2>
        <DataTable
          columns={column}
          data={data}
          addButton={false}
          addButtonNav=""
          searchOn="title"
        />
      </Card>
    );
  }
}
