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
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useConfirm } from "@/hooks/usecontirm";
import type { JobResponse } from "./CreateJob";
import type { IUserList } from "@/components/custom/AddUserToTravel";
import { useDebounce } from "@/hook/DebounceHoot";

interface IUpdateJob {
  title: string;
  summary: string;
  jobPost: string;
  lastApplicationDate: string;
  status: string;
  hrId: number;
  cvReviewersList: number[];
}

export default function UpdateJob({ isViewOnly }: { isViewOnly: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createJob, setCreateJob] = useState<IUpdateJob>();

  const [userList, setUserList] = useState<IUserList[]>([]);
  const [search, setSearch] = useState("");
  const [cvReviewers, setCvReviewers] = useState<number[]>([]);
  const [cvReviewersName, setCvReviewersName] = useState<IUserList[]>([]);

  const [date, setDate] = useState<Date | undefined>();
  const { confirm, ConfirmComponent } = useConfirm();

  const { jobId } = useParams<{ jobId: string }>();
  if (!jobId) {
    notify.error("Error", "Job Id not found while loading page");
    return;
  }

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
    } else {
      setUserList([]);
    }
    return;
  };

  useEffect(() => {
    handleSearch(debounse);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobInfo"],
    queryFn: () =>
      api
        .get<JobResponse>(`/job/${jobId}`, { withCredentials: true })
        .then((res) => res.data),
  });

  useEffect(() => {
    console.log(data);
    if (data) {
      const payload: IUpdateJob = {
        title: data.title,
        summary: data.summary,
        jobPost: data.jobPost,
        lastApplicationDate: data.lastApplicationDate,
        status: data.status,
        hrId: data.hrContact.userId,
        cvReviewersList: data.cvReviewers.map((item) => item.userId),
      };
      console.log(data);
      setCreateJob(payload);
      setCvReviewersName(data.cvReviewers);
      setCvReviewers(data.cvReviewers.map((item) => item.userId));
      setDate(new Date(data.lastApplicationDate));
    }
  }, [data]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IUpdateJob>({ values: createJob });

  const mutation = useMutation({
    mutationFn: (data: IUpdateJob) => {
      console.log(data);
      return api
        .put<JobResponse>(`/job/${jobId}`, data, { withCredentials: true })
        .then((res) => res.data);
    },

    onSuccess: () => {
      notify.success("Success!!!", "Job Details updated successfully.");
    },

    onError: (error) => {
      notify.error("Faild to update job details", error.message);
    },
  });

  const onSubmit = (data: IUpdateJob) => {
    if (!user) {
      notify.error("User Id not found", "Please login again");
      return;
    }

    if (cvReviewers.length <= 0) {
      notify.error("Error", "Atlest select one cv reviewer");
      return;
    }

    const finalData: IUpdateJob = {
      ...data,
      lastApplicationDate: date?.toISOString() as string,
      cvReviewersList: cvReviewers,
      hrId: user?.userId,
    };

    // const formData = new FormData();
    // formData.append("jdFile", selectedFile);

    mutation.mutateAsync(finalData).then((data) => data.jobId);
  };

  const handleDelete = async () => {
    const res = await confirm("Are you sure you want to delete?");
    if (res) {
      try {
        await api.delete(`/job/${jobId}`, { withCredentials: true });
        notify.success("Job deleted succesfully");
        navigate("/job", { replace: true });
      } catch (error: any) {
        notify.error("Error", error.message);
        console.log(error);
      }
    }
  };

  if (isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Card className="bg-white border-0 rounded-md p-5 md:p-10">
      <h2 className="text-2xl font-bold justify-self-center m-2 text-gray-500 bg-white">
        Update Job Details
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
            disabled={isViewOnly}
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
            disabled={isViewOnly}
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
            disabled={isViewOnly}
          />
          {errors.jobPost && (
            <p className="text-red-300 text-sm">
              {errors.jobPost.message as string}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="lappdate">Last application date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!date}
                className="data-[empty=true]:text-muted-foreground w- justify-between text-left font-normal"
                disabled={isViewOnly}
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
                disabled={isViewOnly}
              />
            </PopoverContent>
          </Popover>
          {errors.status && (
            <p className="text-red-300 text-sm">
              {errors.status.message as string}
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
              <Select
                onValueChange={field.onChange}
                defaultValue={data?.status}
              >
                <SelectTrigger
                  className="bg-white text-black"
                  disabled={isViewOnly}
                >
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
          {errors.lastApplicationDate && (
            <p className="text-red-300 text-sm">
              {errors.lastApplicationDate.message as string}
            </p>
          )}
        </div>
        {!isViewOnly && (
          <div className="col-span-2">
            <div className="">
              <Input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                disabled={isViewOnly}
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
                            if (cvReviewers.includes(item.userId)) {
                              notify.error("Already added");
                              return;
                            }
                            setCvReviewers([...cvReviewers, item.userId]);
                            setCvReviewersName([...cvReviewersName, item]);
                          }}
                          type="button"
                          disabled={isViewOnly}
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
        )}
        {!isViewOnly && (
          <div className="col-span-2">
            <div className="p-2 text-gray-500 font-semibold">CV Reviewers</div>
            <div className="flex gap-4">
              {cvReviewersName.map((data: any) => (
                <div
                  className="bg-gray-500 text-white p-2 px-4 rounded-md"
                  key={data.userId}
                  onClick={() => {
                    setCvReviewers(
                      cvReviewers.filter((item) => item != data.userId),
                    );
                    setCvReviewersName(
                      cvReviewersName.filter(
                        (item) => item.userId != data.userId,
                      ),
                    );
                  }}
                >
                  {data.name}
                </div>
              ))}
            </div>
          </div>
        )}
        {!isViewOnly&& (
          <div className="">
            <Button
              variant={"outline"}
              className="bg-black cursor-pointer text-white hover:bg-gray-900"
              disabled={mutation.isPending ? true : false}
              type="submit"
            >
              Update
            </Button>
            <Button
              variant={"outline"}
              className="bg-red-500 cursor-pointer text-white hover:bg-red-700"
              disabled={mutation.isPending ? true : false}
              onClick={handleDelete}
              type="button"
            >
              Delete
            </Button>
            {ConfirmComponent}
          </div>
        )}
      </form>
      <UploadJdFile
        jobId={Number.parseInt(jobId)}
        jdPath={data?.jdFilePath}
        isViewOnly={isViewOnly}
      />
    </Card>
  );
}

function UploadJdFile({
  jobId,
  jdPath,
  isViewOnly,
}: {
  jobId: number;
  jdPath: string | undefined;
  isViewOnly: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [jdFile, setJdFile] = useState<string | null>();

  useEffect(() => {
    setJdFile(jdPath);
  }, [jdPath]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      console.log("request data", data);
      return api
        .post<string>("/job/jd/" + jobId, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
    },

    onSuccess: () => {
      notify.success("Success!!!", "Job Description file added successfully.");
    },

    onError: (error) => {
      notify.error("Faild to add job description file", error.message);
    },
  });

  const handleFileUpload = async () => {
    if (!selectedFile) {
      notify.error("File not selected");
      return;
    }

    const formData = new FormData();
    formData.append("jdFile", selectedFile);

    mutation.mutateAsync(formData);

    if (mutation.isSuccess) setJdFile(mutation.data);
  };

  return (
    <div className="">
      <div className="">
        {!isViewOnly && <label>Update Job Descrition file</label>}
        {!isViewOnly && (
          <div className="flex gap-2 items-center">
            <Input type="file" required onChange={handleFileChange} />
            <Button
              variant={"default"}
              className="bg-black text-white cursor-pointer"
              onClick={handleFileUpload}
              disabled={mutation.isPending ? true : false}
            >
              Upload
            </Button>
          </div>
        )}
        {jdFile && (
          <a href={jdPath} target="_blank" className="text-blue-500 underline">
            View
          </a>
        )}
      </div>
    </div>
  );
}
