import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hook/DebounceHoot";
import type { IUserList } from "@/components/custom/AddUserToTravel";

interface ICreateJob {
  title: string;
  summary: string;
  jobPost: string;
  jdFilePath: string;
  publicId: string;
  lastApplicationDate: string;
  status: string;
  hrId: number;
  cvReviewersList: number[];
}

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

interface IUploadDocRes {
  path: string;
  publicId: string;
}

export default function CreateJob() {
  const { user } = useAuth();
  const [userList, setUserList] = useState<IUserList[]>([]);
  const [search, setSearch] = useState("");
  const [cvReviewers, setCvReviewers] = useState<number[]>([]);
  const [cvReviewersName, setCvReviewersName] = useState<IUserList[]>([]);

  const debounse = useDebounce(search, 500);

  const handleSearch = async (query: any) => {
    if (!query) {
      return;
    }

    if (search.length > 1) {
      try {
        const res = await api
          .get("/users/list" + `?name=${search}`)
          .then((res) => res.data);
        setUserList(res);
      } catch (error: any) {
        console.error(error.message);
      }
    }else{
      setUserList([]);
    }
    return;
  };

  useEffect(() => {
    handleSearch(debounse);
  }, [search]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ICreateJob>();

  const [date, setDate] = useState<Date | undefined>(new Date());

  const [selectedFile, setSelectedFile] = useState<File | null>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const fileUpload = useMutation({
    mutationFn: (data: FormData) => {
      return api
        .post<IUploadDocRes>(`/doc?uploadFor=Jd`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
    },

    onError: (error: any) => {
      notify.error("Error while uploading file", error.response.data.message);
      console.error(error.response)
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ICreateJob) => {
      console.log(data)
      return api
        .post<JobResponse>("/job", data, { withCredentials: true })
        .then((res) => res.data);
    },

    onSuccess: () => {
      notify.success("Success!!!", "Job Details added successfully.");
    },

    onError: (error: any) => {
      notify.error("Faild to add job details", error.response.data.message);
      console.error(error.response)
    },
  });

  const onSubmit = async (data: ICreateJob) => {
    if (!user) {
      notify.error("Logged out", "Please login again");
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
      const res: IUploadDocRes = await fileUpload.mutateAsync(formData);
      publicId = res.publicId;
      const finalData: ICreateJob = {
        ...data,
        jdFilePath: res.path,
        publicId: res.publicId,
        lastApplicationDate: date?.toISOString() as string,
        hrId: user?.userId,
        cvReviewersList: cvReviewers,
      };
      await mutation.mutateAsync(finalData);
    } catch (error: any) {
      console.error(error.response);
      notify.error("Error", error.response.data.message);
      const payload = { publicId: publicId };
      await api.delete("/doc", { data: payload, withCredentials: true });
    }
  };

  return (
    <Card className="bg-white border-0 rounded-md p-5 md:p-10">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        Create New Job
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" grid grid-cols1 md:grid-cols-2 gap-4"
      >
        <div className="">
          <label htmlFor="title">Job Title</label>
          <Input
            id="title"
            type="text"
            {...register("title", { required: "Job Title is requried" })}
            placeholder="Developer"
          />
          {errors.title && (
            <p className="text-red-300 text-sm">
              {errors.title.message as string}
            </p>
          )}
        </div>
        <div className="">
          <label htmlFor="summary">Summary</label>
          <Textarea
            id="summary"
            {...register("summary", { required: "Summary is requried" })}
            placeholder="Creting full stack apps"
          />
          {errors.summary && (
            <p className="text-red-300 text-sm">
              {errors.summary.message as string}
            </p>
          )}
        </div>
        <div className="">
          <label htmlFor="post">Job Post</label>
          <Input
            id="post"
            type="text"
            {...register("jobPost", { required: "Job Post is requried" })}
            placeholder="Intern"
          />
          {errors.jobPost && (
            <p className="text-red-300 text-sm">
              {errors.jobPost.message as string}
            </p>
          )}
        </div>

        <div className="">
          <label>Update Job Descrition file</label>
          <Input type="file" required onChange={handleFileChange} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="lappdate">Last application date</label>
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
              />
            </PopoverContent>
          </Popover>
          {errors.lastApplicationDate && (
            <p className="text-red-300 text-sm">
              {errors.lastApplicationDate.message as string}
            </p>
          )}
        </div>

        <div className="">
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
                    <SelectItem value="OPEN">Open</SelectItem>
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
        <div className="col-span-2">
          <div className="">
            <Input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>
          <div className="">
            {userList.length > 0 ? (
              <div className="max-h-50 overflow-auto">
                {userList.map((item) => (
                  <div
                    className="m-2 border p-2 rounded-md grid grid-cols-2"
                    key={item.userId}
                  >
                    <div className="">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500 font-mono">{item.email}</p>
                    </div>
                    <div className="flex justify-end items-center">
                      <Button
                        className="bg-blue-500 text-white cursor-pointer"
                        onClick={() => {
                          if(cvReviewers.includes(item.userId))
                          {
                            notify.error("Already added")
                            return;
                          }
                          setCvReviewers([...cvReviewers, item.userId]);
                          setCvReviewersName([...cvReviewersName, item]);
                        }}
                        type="button"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-500 m-5">
                No Data
              </div>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <div className="p-2 text-gray-500 font-semibold">CV Reviewers</div>
          <div className="flex gap-4">
            {cvReviewersName.map((data) => (
              <div className="bg-gray-500 text-white p-2 px-4 rounded-md" key={data.userId}>
                {data.name}
              </div>
            ))}
          </div>
        </div>
        <div className="">
          <Button
            variant={"outline"}
            className="bg-black cursor-pointer text-white"
            disabled={mutation.isPending || fileUpload.isPending ? true : false}
          >
            Create
          </Button>
        </div>
      </form>
    </Card>
  );
}
