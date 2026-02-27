import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/custom/Notification";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateOptions } from "../HR/JobManagement/ListJobs";

export interface IExpenseListRes {
  expenseId: number;
  amount: number;
  category: string;
  expenseDate: string;
  uploadedByUserId: number;
  travelId: number;
  expensesSplits: ExpensesSplit[];
  approvedAt: string;
  status: string;
  remarks: string;
  expensesProofs: ExpensesProof[];
  uploadedBy: UploadedBy;
}

export interface ExpensesProof {
  proofFilePath: string;
  proofId: number;
}

export interface ExpensesSplit {
  splitAmount: number;
  travelingUserId: number;
  splitId: number;
  travelingUser: TravelingUser;
}

export interface TravelingUser {
  travelingUserId: number;
  travelBalance: number;
  usedBalance: number;
  user: User;
}

export interface User {
  userId: number;
  name: string;
  email: string;
}

export interface UploadedBy {
  userId: number;
  name: string;
  email: string;
}

export interface IBudget {
  travelBalance: number;
  usedBalance: number;
}

export default function ExpenseList({
  isForApproval,
}: {
  isForApproval: boolean;
}) {
  const { travelId } = useParams();
  const [expenseList, setExpenseList] = useState<IExpenseListRes[]>([]);
  const [budget, setBudget] = useState<IBudget>({
    travelBalance: 0,
    usedBalance: 0,
  });
  const [remarks, setRemarks] = useState("");
  const { user } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString());
  const [status, setStatus] = useState("");

  const travelingUserBudget = useQuery({
    queryKey: ["myBudget", travelId, user?.userId],
    queryFn: async () =>
      await api
        .get<IBudget>(
          `/travel/traveling-user/travelId/${travelId}/userId/${user?.userId}`,
        )
        .then((res) => res.data),
    enabled: !isForApproval && !!user?.userId && !!travelId,
  });

  useEffect(() => {
    if (travelingUserBudget.data) {
      setBudget(travelingUserBudget.data);
    }
  }, [travelingUserBudget.data]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "allExpenses",
      isForApproval,
      user?.userId,
      travelId,
      startDate,
      endDate,
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate > endDate) {
        notify.error(
          "Error",
          "Starting date can not be grater then ending date",
        );
        return [];
      }
      if (startDate)
        params.append("startDate", new Date(startDate).toISOString());
      if (endDate) params.append("endDate", new Date(endDate).toISOString());

      const res = api
        .get<
          IExpenseListRes[]
        >(isForApproval ? `/travel/expense/${travelId}?${params.toString()}` : `/travel/expense/user/${user?.userId}/travel/${travelId}`)
        .then((res) => res.data);
      return res;
    },
    enabled: !!user?.userId && !!travelId,
  });

  useEffect(() => {
    if (data) {
      setExpenseList(data);
    }
  }, [data]);

  useEffect(() => {
    if (data && status.length > 0) {
      if (status === "ALL") setExpenseList(data);
      else setExpenseList(data.filter((val) => val.status === status));
    }
  }, [status]);

  const changeStatus = useMutation({
    mutationFn: async ({
      id,
      statusdata,
    }: {
      id: number;
      statusdata: string;
    }) => {
      return await api
        .patch(`/travel/expense/${id}`, {
          status: statusdata,
          remarks: remarks,
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success", "Stauts updated successfully");
      setRemarks("");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
      setRemarks("");
      return;
    },
  });

  // const deleteExpense = useMutation({
  //   mutationFn: async (id: number) => {
  //     return await api.delete(`/travel/expense/${id}`).then((res) => res.data);
  //   },
  //   onSuccess: (_, id) => {
  //     notify.success("Expense deleted");
  //     setExpenseList(expenseList.filter((val) => val.expenseId != id));
  //   },
  //   onError: (error: any) => {
  //     notify.error("Error", error.response.data.message);
  //     console.error(error.response);
  //   },
  // });

  const handleApproval = async (id: number, status: string) => {
    await changeStatus.mutateAsync({ id: id, statusdata: status });
    const val = expenseList.find((val) => val.expenseId === id);
    console.log(val);
    if (val)
      setExpenseList([
        ...expenseList.filter((val) => val.expenseId != id),
        { ...val, status: status },
      ]);
  };

  if (isLoading || travelingUserBudget.isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError || travelingUserBudget.isError)
    return (
      <div className="text-red-500">
        Error:{" "}
        {travelingUserBudget.isError
          ? travelingUserBudget.error.message
          : error?.message}
      </div>
    );

  return (
    <Card className="bg-white border-0 p-5 md:p-10 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-2">
          <h2 className="text-2xl font-bold text-gray-500 bg-white">
            Expense List
          </h2>
          <div className="">
            {!isForApproval && (
              <div className="mt-5">
                <Link to={"add"} className="border rounded-md p-2 px-4">
                  Add Expense
                </Link>
              </div>
            )}
            <div className="mt-4 flex gap-4">
              <Select onValueChange={(value) => setStatus(value)}>
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {user?.role === "HR" && (
                <div className="flex gap-4">
                  <Input
                    type="date"
                    value={startDate}
                    className="bg-white"
                    onChange={(e) => setStartDate(e.target.value)}
                  />

                  <Input
                    type="date"
                    value={endDate}
                    className="bg-white"
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-2 md:justify-self-end">
          {!isForApproval && (
            <div className="">
              <p className="text-gray-500 font-bold">
                My Budget: {budget.travelBalance}
              </p>
              <p className="text-gray-500 font-bold">
                Remaining: {budget.travelBalance - budget.usedBalance}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="">
        {expenseList.length > 0 ? (
          expenseList.map((item) => (
            <div
              className="p-2 my-4 rounded-md shadow-md bg-gray-100"
              key={item.expenseId.toString() + "_expense"}
            >
              <div className="p-2">
                <div className="grid grid-cols-2 items-center">
                  <p className="text-sm font-mono">
                    Expense ID: {item.expenseId}
                  </p>
                  {/* {isForApproval && (
                    <Button
                      variant={"destructive"}
                      className="bg-red-300 border-red-600 border justify-self-end"
                      onClick={() => deleteExpense.mutate(item.expenseId)}
                      disabled={deleteExpense.isPending ? true : false}
                    >
                      Delete
                    </Button>
                  )} */}
                </div>
                <p className="font-semibold text-gray-800">
                  Spent Amount: {item.amount}
                </p>
                <div className="flex gap-4">
                  <Badge className="border border-black mt-2">
                    {item.category}
                  </Badge>
                  <Badge
                    className={`border border-black mt-2 text-white 
                        ${
                          item.status === "REJECTED"
                            ? "bg-red-300 border-red-500 "
                            : item.status === "PENDING"
                              ? "bg-amber-200 border-amber-500"
                              : "bg-green-300 border-green-500"
                        }`}
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="">{new Date(item.expenseDate).toLocaleDateString(undefined, DateOptions)}</p>
              </div>
              <div className="">
                <ListExpsenseProofs proofs={item.expensesProofs} />
              </div>

              <div className="text-xl font-bold text-gray-500 pl-2">Splits</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-auto">
                {item.expensesSplits.map((splits) => (
                  <ExpenseSplits
                    splits={splits}
                    key={splits.splitId.toString() + "_split"}
                  />
                ))}
              </div>
              <UploadedBy user={item.uploadedBy} />
              <div className="p-2">
                <div className="p-2 font-bold">Remarks:</div>
                <Textarea
                  className="m-2"
                  placeholder="Remarks..."
                  defaultValue={item.remarks}
                  disabled={!isForApproval}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              {isForApproval && (
                <div className="flex gap-4 p-2">
                  <Button
                    className="bg-green-200 border border-green-600 cursor-pointer"
                    onClick={() => handleApproval(item.expenseId, "APPROVED")}
                  >
                    Approve
                  </Button>
                  <Button
                    className="bg-red-200 border border-red-600 cursor-pointer"
                    onClick={() => handleApproval(item.expenseId, "REJECTED")}
                  >
                    Reject
                  </Button>
                  <Button
                    className="bg-yellow-200 border border-yellow-600 cursor-pointer"
                    onClick={() => handleApproval(item.expenseId, "PENDING")}
                  >
                    Pending
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center text-gray-500">
            No Expenses
          </div>
        )}
      </div>
    </Card>
  );
}

function ExpenseSplits({ splits }: { splits: ExpensesSplit }) {
  const user = splits.travelingUser.user;
  //   const travelingInfo = splits.travelingUser;

  return (
    <div className="border p-4 m-2 rounded-md">
      <div className="flex gap-4">
        <p className="font-semibold text-sm">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <p className="text-sm text-gray-500">
        <b>Split Amount:</b> {splits.splitAmount}
      </p>
      {/* <p className="text-sm text-gray-500">
        <b>Provided Balance:</b> {travelingInfo.travelBalance}
      </p>
      <p className="text-sm text-gray-500">
        <b>Remaining Balance:</b>{" "}
        {travelingInfo.travelBalance - travelingInfo.usedBalance}
      </p> */}
    </div>
  );
}

function UploadedBy({ user }: { user: User }) {
  return (
    <div className="bg-gray-200 shadow-md rounded-md m-2 p-4">
      <h1 className="text-gray-500 font-semibold">Uploaded By</h1>
      <div className="flex gap-4">
        <p className="font-semibold text-sm">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
  );
}

export function ListExpsenseProofs({ proofs }: { proofs: ExpensesProof[] }) {
  return (
    <div className="flex flex-col p-2">
      {proofs.map((item, index) => (
        <a
          href={item.proofFilePath}
          className="text-blue-500 underline"
          key={item.proofId + "_proof"}
        >
          Proof {index + 1}
        </a>
      ))}
    </div>
  );
}
