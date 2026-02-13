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
import React, { useState } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { notify } from "@/components/custom/Notification";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/api";
import type { IAddTravelDetails } from "./AddTravel";
import ImageContainer from "@/components/custom/ImageContainer";

export interface ITravelDetails {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  status: string;
  assignedBudget: number;
  totalExpense: number;
  createdById: number;
  travelId: number;
  travelGallery: TravelGallery[];
  createdByUser: CreatedByUser;
}

export interface TravelGallery {
  imageId: number;
  filePath: string;
  uploadedAt: string;
}

export interface CreatedByUser {
  userId: number;
  name: string;
  email: string;
}

export default function UpdateTravelDetails() {
  const server_url = import.meta.env.VITE_SERVER_URL;

  const { user } = useAuth();

  const { travelId } = useParams();

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });

  const [uploaded, setUploaded] = useState<TravelGallery[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["travelDetails"],
    queryFn: () =>
      axios
        .get(server_url + `/travel/${travelId}`, { withCredentials: true })
        .then((res) => res.data.data),
  });

  //   console.log(data);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ITravelDetails>({
    values: data,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log("This is data: ", data);
      return api
        .put(server_url + `/travel/${travelId}`, data, {
          withCredentials: true,
        })
        .then((res) => res.data);
    },

    onSuccess: () => {
      notify.success("Success!!!", "Travel Details added successfully.");
    },

    onError: (error) => {
      notify.error("Faild to add travel details", error.message);
      console.log(error.cause);
    },
  });

  const onSubmit = async (data: IAddTravelDetails) => {
    const finalData = {
      title: data.title,
      description: data.description,
      status: data.status,
      assignedBudget: data.assignedBudget,
      totalExpense: data.totalExpense,
      startDate: date?.from?.toISOString(),
      endDate: date?.to?.toISOString(),
      updatedBy: user?.userId,
    };

    console.log(mutation.mutateAsync(finalData));
  };

  const handleDelete = async () => {
    try {
      const res = confirm("Are you sure you want to delete travel.");
      if (res === true) {
        await axios.delete(server_url + `/travel/${travelId}`, {
          withCredentials: true,
        });
        notify.success("Travel Plan deleted successfully");
        navigate("/travel", { replace: true });
      }
    } catch (err: any) {
      console.log(err);
      notify.error("Error", err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0){
      setSelectedFile(e.target.files[0]);
    }
  }

  const handleImageUpload = async() => {
    if(!selectedFile){
      alert("Please select an image")
      return
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('files', selectedFile);

    try{
      const response = await api.post(`travel/gallery/${travelId}`, formData, {withCredentials: true}).then(res => res.data);
      setUploaded([...uploaded, response])
      notify.success("Image uploaded successfully")
    }catch(error: any){
      notify.error("Error", error.message);
      console.log("Error in uploading image", error)
    }
    finally{
      setLoading(false);
    }
    
  }

  if (isLoading) return <div className="">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-full">
      <Button
        variant="outline"
        className="m-4"
        onClick={handleDelete}
      >
        Delete Travel plan
      </Button>
      <Card className="m-4 p-5 md:p-10 mb-5 bg-linear-to-br from-sky-900 to-sky-300 border-0 text-white">
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
                      <SelectItem value="CLOSED">Closed</SelectItem>
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
                min: 0,
              })}
              min={0}
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
                min: 0,
              })}
              min={0}
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

      <div className="border rounded-lg border-gray-400 m-4">
        <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 ">
          Images
        </h2>

        <hr className="text-gray-400" />
        <div className="p-5">
          <div className="flex gap-4">
            <Input type="file" onChange={handleFileChange}/>
            <Button className="bg-blue-500 text-white" onClick={handleImageUpload} disabled={loading}>Upload</Button>
          </div>
        </div>
        {data?.travelGallery.length > 0 ? (
          <div className="grid grid-cols-1">
            <div className="grid grid-cols-1 md:grid-cols-3 p-4">
              {data?.travelGallery.map((item: TravelGallery) => (
                <ImageContainer imageData={item} key={item.imageId} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 flex items-center justify-center p-5">
            No Images Uploaded
          </div>
        )}
      </div>
      <div className="border rounded-lg border-gray-400 m-4">
        <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 ">
          Uploaded Images
        </h2>
        {data?.travelGallery.length > 0 ? (
          <div className="grid grid-cols-1">
            <div className="grid grid-cols-1 md:grid-cols-3 p-4">
              {data?.travelGallery.map((item: TravelGallery) => (
                <ImageContainer imageData={item} key={item.imageId} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 flex items-center justify-center p-5">
            No Images Uploaded
          </div>
        )}
      </div>
    </div>
  );
}
