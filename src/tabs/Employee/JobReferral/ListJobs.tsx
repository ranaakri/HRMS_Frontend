import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobResponse } from "@/tabs/HR/JobManagement/CreateJob";
import { DataTable } from "@/tabs/HR/JobManagement/datatable";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { notify } from "@/components/custom/Notification";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface IShareEmail {
  email: string;
}

interface IShareEmailPayload {
  recipientEmail: string;
  sharedBy: number;
  jobId: number;
}

interface IReferrFrined {
  candidateName: string;
  candidateEmail: string;
  cvPath: string;
  publicId: string;
  uploadedAt: string;
  referralNote: string;
  jobId: number;
  referredById: number;
}

interface IReferrFrinedInput {
  candidateName: string;
  candidateEmail: string;
  referralNote: string;
}

interface IUploadCvRes {
  path: string;
  publicId: string;
}

const ShareJobAction = ({
  jobId,
  userId,
}: {
  jobId: number;
  userId: number | undefined;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IShareEmail>();

  const shareJob = useMutation({
    mutationFn: (data: IShareEmailPayload) => {
      return api.post(`/job-shared`, data, { withCredentials: true });
    },

    onSuccess: () => {
      notify.success("Shared", "Job shared to friend successfully");
    },

    onError: (error) => {
      notify.error("Error", error.message);
    },
  });

  const handleShareByEmail = (data: IShareEmail) => {
    if (!userId) {
      notify.error("User Id not found", "Plese login again");
      return;
    }
    const payload: IShareEmailPayload = {
      recipientEmail: data.email,
      sharedBy: userId,
      jobId: jobId,
    };
    shareJob.mutateAsync(payload);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-white">
        <form onSubmit={handleSubmit(handleShareByEmail)}>
          <DialogHeader>
            <DialogTitle>Share Job</DialogTitle>
            <DialogDescription>Share job via email...</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label htmlFor={`email-${jobId}`}>Email</label>
            <Input
              id={`email-${jobId}`}
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter valid email",
                },
              })}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={shareJob.isPending ? true : false}>Share</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ReferrJobAcction = ({
  jobId,
  userId,
}: {
  jobId: number;
  userId: number | undefined;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IReferrFrined>();

  const referrFriend = useMutation({
    mutationFn: (data: IReferrFrined) => {
      return api.post(`/referral`, data, { withCredentials: true });
    },

    onSuccess: () => {
      notify.success("Referred", "Friend referred successfully");
    },

    onError: (error) => {
      notify.error("Error", error.message);
    },
  });

  const uploadCv = useMutation({
    mutationFn: (data: FormData) => {
      return api
        .post<IUploadCvRes>(`/doc?uploadFor=Cv`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
    },

    onError: (error) => {
      notify.error("Error while uploading CV", error.message);
    },
  });

  const handleShareByEmail = async (data: IReferrFrinedInput) => {
    if (!userId) {
      notify.error("User Id not found", "Plese login again");
      return;
    }

    if (!selectedFile) {
      notify.error("File not selected");
      return;
    }

    const formData = new FormData();
    formData.append("doc", selectedFile);
    let publicId;
    try {
      const res = await uploadCv.mutateAsync(formData);

      const payload: IReferrFrined = {
        candidateEmail: data.candidateEmail,
        candidateName: data.candidateName,
        referralNote: data.referralNote,
        publicId: res.publicId,
        cvPath: res.path,
        referredById: userId,
        jobId: jobId,
        uploadedAt: new Date().toISOString()
      };
      publicId = res.publicId;

      await referrFriend.mutateAsync(payload);
    } catch (error: any) {
      notify.error("Error", error.message);
      console.error(error.message);
      const payload = { publicId: publicId };
      await api.delete("/doc", { data: payload, withCredentials: true });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-gray-600 text-white">
          Referr Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-white">
        <form onSubmit={handleSubmit(handleShareByEmail)}>
          <DialogHeader>
            <DialogTitle>Referr Friend</DialogTitle>
            <DialogDescription>
              Referr any friend for this job...
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label htmlFor={`name-${jobId}`}>Name</label>
            <Input
              id={`name-${jobId}`}
              type="text"
              {...register("candidateName", {
                required: "Candidate name is required",
              })}
              placeholder="John Doe"
            />
            {errors.candidateName && (
              <p className="text-red-500 text-sm">
                {errors.candidateName.message}
              </p>
            )}
          </div>

          <div className="py-4">
            <label htmlFor={`email-${jobId}`}>Email</label>
            <Input
              id={`email-${jobId}`}
              type="email"
              {...register("candidateEmail", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter valid email",
                },
              })}
              placeholder="email@example.com"
            />
            {errors.candidateEmail && (
              <p className="text-red-500 text-sm">
                {errors.candidateEmail.message}
              </p>
            )}
          </div>

          <div className="py-4">
            <label htmlFor={`file-${jobId}`}>CV</label>
            <Input
              id={`file-${jobId}`}
              type="file"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="py-4">
            <label htmlFor={`referralNote-${jobId}`}>
              Referral Note {"("}optional{")"}
            </label>
            <Textarea
              id={`referralNote-${jobId}`}
              {...register("referralNote")}
              placeholder="Note..."
            />
            {errors.referralNote && (
              <p className="text-red-500 text-sm">
                {errors.referralNote.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={(uploadCv.isPending || referrFriend.isPending) ? true : false}>Referr</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function ListJobsEmployee() {

  const { user } = useAuth();

  const column: ColumnDef<JobResponse>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "lastApplicationDate",
      header: "Last Application Date",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
    {
      header: "Action",
      cell: ({ row }) => {
        const rowdata = row.original;
        return (
          <div className="flex justify-center items-center gap-2">
            <Link
              to={"view/"+rowdata.jobId}
              className="bg-black text-white p-2 px-4 rounded-md"
            >
              View
            </Link>
            <ReferrJobAcction jobId={rowdata.jobId} userId={user?.userId} />
            <ShareJobAction jobId={rowdata.jobId} userId={user?.userId} />
          </div>
        );
      },
    },
  ];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["OpenJobs"],
    queryFn: () =>
      api.get("/job/open", { withCredentials: true }).then((res) => res.data),
  });

  if (isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Card className="bg-white border-0 p-5 md:p10">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        Open Jobs
      </h2>
      <div className="flex gap-4">
        <Link to={"my-referrals"} className="p-2 px-4 rounded-md bg-black text-white">
          My Refferals
        </Link>
        <Link
          to={"my-shares"}
          className="p-2 px-4 rounded-md bg-black text-white"
        >
          My Shares
        </Link>
      </div>
      <DataTable
        columns={column}
        data={data}
        searchOn="title"
        addButton={false}
        addButtonNav=""
      />
    </Card>
  );
}
