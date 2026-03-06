import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

interface ITravelingUser {
  travelingUserId: number;
  travelBalance: number;
  usedBalance: number;
  user: User;
}

interface User {
  userId: number;
  name: string;
  email: string;
}

interface Expense {
  amount: number;
  category: string;
  expenseDate: string;
  uploadedByUserId: number;
  travelId: number;
  expensesSplits: ExpensesSplit[];
  expenseProof: ProofPath[];
}

interface ProofPath {
  path: string;
  publicId: string;
}

interface ExpensesSplit {
  splitAmount: number;
  travelingUserId: number;
}

interface InputData {
  amount: number;
  category: string;
  expenseDate: string;
}

interface DraftFile {
  name: string;
  data: string;
}

interface DraftExpense {
  expense: Expense;
  splits: ITravelingUser[];
  users: ITravelingUser[];
  files: DraftFile[];
}

export default function AddExpense() {
  const { user } = useAuth();
  const { travelId } = useParams();
  const [date, setDate] = useState<Date>(new Date());
  const [usersList, setUsersList] = useState<ITravelingUser[]>([]);
  const [sharingExpense, setSharingExpense] = useState<ITravelingUser[]>([]);
  const [splitAmount, setSplitAmount] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File[]>([]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const [isDraft, setIsDraft] = useState<boolean>();
  const [executeQuery, setExecuteQuery] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InputData>();

  useEffect(() => {
    if (!travelId) return;

    const key = `DraftAll${travelId}`;
    let draftString = localStorage.getItem(key);

    if (draftString) {
      try {
        const draft: DraftExpense = JSON.parse(draftString);
        setIsDraft(true);
        setSharingExpense(draft.splits);
        setUsersList(draft.users);
        setSplitAmount(draft.expense.amount);
        reset({
          amount: draft.expense.amount,
          category: draft.expense.category,
          expenseDate: draft.expense.expenseDate,
        });
        setDate(new Date(draft.expense.expenseDate));

        if (draft.files && draft.files.length > 0) {
          const restored = draft.files.map((f) => {
            const parts = f.data.split(",");
            const mime = parts[0].match(/:(.*?);/)?.[1] || "";
            const bstr = atob(parts[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], f.name, { type: mime });
          });
          setSelectedFile(restored);
        }
      } catch (e) {
        console.error("Failed to parse draft data", e);
      }
    }else{
      setIsDraft(false);
      setExecuteQuery(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile([...selectedFile, e.target.files[0]]);
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["travelingUsersData", travelId, isDraft],
    queryFn: async () => {
      return await api
        .get<ITravelingUser[]>(`/travel/traveling-user/${travelId}`)
        .then((res) => res.data);
    },
    enabled: !!travelId && executeQuery,
  });

  useEffect(() => {
    if (data && usersList.length === 0) {
      setUsersList(data.filter((item) => item.user.userId !== user?.userId));
      const me = data.filter((item) => item.user.userId === user?.userId);
      setSharingExpense(me);
    }
  }, [data]);

  const addExpense = useMutation({
    mutationFn: async (data: Expense) => {
      return await api.post("/travel/expense", data).then((res) => res.data);
    },

    onSuccess: () => {
      notify.success("Success", "Expense Added Successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const addMultipleFiles = useMutation({
    mutationFn: async (data: FormData) => {
      return await api
        .post<ProofPath[]>("/doc/multiple?uploadFor=Proof", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data);
    },
    onError: (error: any) => {
      notify.success("Error", error.response.data.message);
      console.error(error.cause);
    },
  });

  const onSubmit = async (data: InputData) => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }

    if (!travelId) {
      notify.error("Travel id not found");
      return;
    }

    const expSplit = sharingExpense.map((item) => ({
      splitAmount: splitAmount / sharingExpense.length,
      travelingUserId: item.travelingUserId,
    }));

    if (!isDraft) {
      if (selectedFile.length === 0) {
        notify.error("Select Proof file");
        return;
      }

      if (expSplit.length < 1) {
        notify.error("Error", "No user selected for split");
        return;
      }
    }

    let publicIds: ProofPath[] | null = null;

    try {
      if (selectedFile.length > 0) {
        const formData = new FormData();
        for (const element of selectedFile) {
          formData.append("files", element);
        }
        publicIds = await addMultipleFiles.mutateAsync(formData);
      }

      const payload: Expense = {
        amount: data.amount,
        category: data.category,
        expenseDate: date.toISOString(),
        uploadedByUserId: user.userId,
        travelId: Number(travelId),
        expensesSplits: expSplit,
        expenseProof: publicIds || [],
      };

      if (isDraft) {
        const filesData: DraftFile[] = await Promise.all(
          selectedFile.map(async (f) => ({
            name: f.name,
            data: await fileToBase64(f),
          })),
        );

        const draftObj: DraftExpense = {
          expense: payload,
          splits: sharingExpense,
          users: usersList,
          files: filesData,
        };

        localStorage.setItem(`DraftAll${travelId}`, JSON.stringify(draftObj));
        notify.success("Draft", "Expense saved as draft");
      } else {
        await addExpense.mutateAsync(payload);
        localStorage.removeItem(`DraftAll${travelId}`);
      }
    } catch (error: any) {
      notify.error("Error", "Error in adding expense");
      console.error(error);

      if (publicIds && publicIds.length > 0) {
        try {
          const deletePayload = publicIds.map((val) => val.publicId);

          await api.delete("/doc/multiple", {
            data: deletePayload,
            withCredentials: true,
          });
        } catch (deleteError) {
          console.error("Error deleting uploaded files:", deleteError);
        }
      }
    }
  };

  const handleAddSplit = (item: ITravelingUser) => {
    if (
      item.travelBalance - item.usedBalance <
      splitAmount / (sharingExpense.length + 1)
    ) {
      notify.error("Insufficient balance");
      return;
    }
    if (sharingExpense.some((data) => data.user.userId === item.user.userId)) {
      notify.error("User already added in split");
      return;
    }
    setSharingExpense([...sharingExpense, item]);
    setUsersList(
      usersList.filter((data) => data.user.userId != item.user.userId),
    );
  };

  const handleRemoveFormSplit = (item: ITravelingUser) => {
    if (item.user.userId === user?.userId) {
      notify.error("Can not remove your self");
      return;
    }
    setSharingExpense((prev) =>
      prev.filter((val) => val.travelingUserId != item.travelingUserId),
    );
    setUsersList((prev) => [...prev, item]);
  };

  if (isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Card className="p-5 md:p-10 border-0 shadow-md bg-white">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        Add Expense
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="flex items-center gap-2  col-span-2">
          <input
            type="checkbox"
            id="draft"
            checked={isDraft}
            onChange={() => setIsDraft((prev) => !prev)}
          />
          <label htmlFor="draft">Draft</label>
        </div>
        <div className="">
          <label htmlFor="amount">Amount</label>
          <Input
            type="number"
            id="amount"
            {...register("amount", { required: "Amount is required" })}
            defaultValue={0}
            min={0}
            onChange={(e) => setSplitAmount(Number(e.target.value))}
          />
          {errors.amount && (
            <p className="text-red-300 text-sm">
              {errors.amount.message as string}
            </p>
          )}
        </div>
        <div className="">
          <label htmlFor="category">Category</label>
          <Controller
            name="category"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="bg-white text-black">
                    <SelectItem value="FOOD">Food</SelectItem>
                    <SelectItem value="SHOPPING">Shoping</SelectItem>
                    <SelectItem value="HOTEL">Hotel</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-red-300 text-sm">
              {errors.category.message as string}
            </p>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="lappdate">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!date}
                className="data-[empty=true]:text-muted-foreground w-53 justify-between text-left font-normal"
              >
                <CalendarIcon />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => setDate(newDate)}
                className="bg-white"
                required
              />
            </PopoverContent>
          </Popover>
          {errors.expenseDate && (
            <p className="text-red-300 text-sm">
              {errors.expenseDate.message as string}
            </p>
          )}
        </div>
        <div className="col-span-2">
          <label htmlFor="proof">Add Expense Proof</label>
          <div className="flex gap-4">
            <Input
              type="file"
              id="proof"
              onChange={handleFileChange}
              required={!isDraft}
            />
          </div>
          <div className="">
            {selectedFile.length > 0 &&
              selectedFile.map((item, index) => (
                <div className="" key={item.name + index}>
                  {item.name}
                </div>
              ))}
          </div>
        </div>
        <div className="">
          <Button
            className="bg-black text-white"
            disabled={addExpense.isPending || addMultipleFiles.isPending}
          >
            {isDraft ? "Save As Draft" : "Add Expense"}
          </Button>
        </div>
      </form>
      <div className="font-bold text-gray-500 text-xl">Expense Split with</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sharingExpense.length > 0 &&
          sharingExpense.map((item) => (
            <div
              className="border grid grid-cols-2 items-center p-2 rounded-md"
              key={item.travelingUserId}
              onClick={() => handleRemoveFormSplit(item)}
            >
              <div className="">{item.user.name}</div>
              <div className="justify-self-end">
                Split: {splitAmount / sharingExpense.length}
              </div>
            </div>
          ))}
      </div>
      <div className="font-bold text-gray-500 text-xl">Traveling Users</div>
      {usersList.length > 0 ? (
        usersList.map((item) => (
          <div
            className="border grid grid-cols-2 md:grid-cols-3 items-center p-2 rounded-md"
            key={item.travelingUserId}
          >
            <div className="">{item.user.name}</div>
            <div className="">
              Balance: {item.travelBalance - item.usedBalance}
            </div>
            <Button
              className="justify-self-end bg-black text-white"
              onClick={() => handleAddSplit(item)}
              disabled={addExpense.isPending || addMultipleFiles.isPending}
            >
              Add
            </Button>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center text-gray-500">
          No Users
        </div>
      )}
    </Card>
  );
}
