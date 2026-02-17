import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { DateOptions } from "./ListJobs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { notify } from "@/components/custom/Notification";

export interface IJobReferralsRes {
  candidateEmail: string;
  candidateName: string;
  createdAt: string;
  cvPath: string;
  referralId: number;
  referralNote: string;
  referredBy: ReferredBy;
  status: string;
}

export interface HrContact {
  email: string;
  name: string;
  userId: number;
}

export interface ReferredBy {
  email: string;
  name: string;
  userId: number;
}

export default function JobReferral() {
  const { jobId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sharedLog"],
    queryFn: () =>
      api
        .get<IJobReferralsRes[]>("/referral/job/" + jobId)
        .then((res) => res.data),
  });

  if (isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Card className="bg-white p-5 md:p-10 border-0 shadow-md">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        Job Referrals
      </h2>
      {data &&
        (data.length > 0 ? (
          data?.map((item) => (
            <CandidateCard item={item} key={item.referralId} />
          ))
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            No Referrals
          </div>
        ))}
    </Card>
  );
}

function CandidateCard({ item }: { item: IJobReferralsRes }) {
  const [status, setStatus] = useState(item.status);

  const changeStatus = useMutation({
    mutationFn: () => {
      return api
        .patch(`/referral/${item.referralId}?status=${status}`)
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success", "Status successfully changed");
    },
    onError: (error) => {
      notify.error("Error", error.message);
      console.error(error.cause);
    },
  });

  return (
    <Card
      className="p-5 md:p-10 border border-gray-400 shadow-md"
      key={item.referralId}
    >
      <div className="text-xl font-bold text-gray-500">Candidate</div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="col-span-2 mb-4">
          <p className="font-semibold text-xl">{item.candidateName}</p>
          <p className="font-semibold text-gray-600">{item.candidateEmail}</p>
        </div>
        <a className="text-blue-500 underline" href={item.cvPath}>
          View CV
        </a>
        <p className="text-sm text-gray-500">
          Reffered at:{" "}
          {new Date(item.createdAt).toLocaleDateString(undefined, DateOptions)}
        </p>
        <p className="text-sm">{item.referralNote}</p>
      </div>
      <div className="">
        <div className="text-xl font-bold text-gray-500">Referred By</div>
        <p className="">{item.referredBy.name}</p>
        <p className="">{item.referredBy.email}</p>
      </div>
      <div className="">
        <Select
          onValueChange={async (value) => {
            setStatus(value);
            await changeStatus.mutateAsync();
          }}
          defaultValue={status}
          disabled={changeStatus.isPending ? true : false}
        >
          <SelectTrigger className="bg-white text-black">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="bg-white text-black">
              <SelectItem value="UNDERPENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="SELECTED">Selected</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
