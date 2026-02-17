import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import type { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@/components/custom/Notification";
import { useAuth } from "@/context/AuthContext";

export interface IAddTravelDetails {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  status: string;
  assignedBudget: number;
  totalExpense: number;
  createdById: number;
}

export default function AddTravel() {
  const server_url = import.meta.env.VITE_SERVER_URL;

  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });

  const mutation = useMutation({
    mutationFn: (data: IAddTravelDetails) => {
      console.log("This is data: ", data);
      return axios
        .post(server_url + "/travel", data, { withCredentials: true })
        .then((res) => res.data.data);
    },

    onSuccess: () => {
      notify.success("Success!!!", "Travel Details added successfully.");
    },

    onError: (error) => {
      notify.error("Faild to add travel details", error.message);
      console.log(error.cause);
    },
  });

  const onSubmit = async (data: any) => {
    const finalData: IAddTravelDetails = {
      ...data,
      startDate: date?.from?.toISOString(),
      endDate: date?.to?.toISOString(),
      createdById: user?.userId,
    };

    mutation.mutateAsync(finalData);
  };

  // if(mutation.isError) return <div className="">{mutation.error.message}</div>

  return (
    <Card className="p-5 md:p-10 border-0 bg-white">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        Create New Travel Plan
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="flex flex-col gap-2">
          <label>Title</label>
          <Input
            placeholder="Canada Trip"
            className="bg-white text-black"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-red-300 text-sm">
              {errors.title.message as string}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label>Start and End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start bg-white text-black"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from
                  ? date?.to
                    ? `${format(date.from, "LLL dd, y")} - ${format(
                        date.to,
                        "LLL dd, y",
                      )}`
                    : format(date.from, "LLL dd, y")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white text-black">
              <Calendar
                mode="range"
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-2">
          <label>Status</label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="bg-white text-black">
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-red-300 text-sm">
              {errors.status.message as string}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label>Assigned Budget</label>
          <Input
            type="number"
            defaultValue={1000}
            className="bg-white text-black"
            {...register("assignedBudget", {
              required: "Budget is required",
              valueAsNumber: true,
            })}
          />
          {errors.assignedBudget && (
            <p className="text-red-300 text-sm">
              {errors.assignedBudget.message as string}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label>Total Expense Till Now</label>
          <Input
            type="number"
            defaultValue={0}
            className="bg-white text-black"
            {...register("totalExpense", {
              required: "Total expense is required",
              valueAsNumber: true,
            })}
          />
          {errors.totalExpense && (
            <p className="text-red-300 text-sm">
              {errors.totalExpense.message as string}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label>Description</label>
          <Textarea
            placeholder="Type your trip description here..."
            className="bg-white text-black"
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <p className="text-red-300 text-sm">
              {errors.description.message as string}
            </p>
          )}
        </div>
        <div className="flex gap-4 md:col-span-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-white text-black hover:bg-gray-300 cursor-pointer"
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={mutation.isPending ? true : false}
          >
            Submit
          </Button>
        </div>
      </form>
    </Card>
  );
}
