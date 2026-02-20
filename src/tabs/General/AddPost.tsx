import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export interface CreatePost {
  title: string;
  description: string;
  tags: string;
  postType: string;
  imagePath: string;
  publicId: string;
  authorId: number;
  visibleToManager: boolean;
  visibleToEmp: boolean;
}

export interface DocUpload {
  path: string;
  publicId: string;
}

export default function CreatePost() {
  const { user } = useAuth();
  const [postType, setPostType] = useState<"Image" | "Text">("Text");
  const [emp, setEmp] = useState(true);
  const [manager, setManager] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addImage = useMutation({
    mutationFn: async (data: FormData) => {
      return api
        .post<DocUpload>("/doc?uploadFor=Post", data)
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Post created successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.message);
      console.error(error.response);
    },
  });

  const uploadPost = useMutation({
    mutationFn: async (data: CreatePost) => {
        console.log(data)
      return api.post("/post", data).then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Post created successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePost>();

  const onSubmit = async (data: CreatePost) => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
    if (postType === "Image") {
      if (!selectedFile) {
        notify.error("Image is not selected");
        return;
      }
      const formData = new FormData();
      formData.append("doc", selectedFile);

      let publicId;
      try {
        const res = await addImage.mutateAsync(formData);
        publicId = res.publicId;
        const payload: CreatePost = {
          title: data.title,
          description: data.description,
          tags: data.tags,
          postType: "I",
          imagePath: res.path,
          publicId: res.publicId,
          authorId: user.userId,
          visibleToEmp: emp,
          visibleToManager: manager,
        };
        await uploadPost.mutateAsync(payload);
      } catch (error: any) {
        notify.error("Error", "Error while uploading post");
        await api.delete("/doc", { data: publicId });
      }
    } else {
      const payload: CreatePost = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        postType: "T",
        imagePath: "",
        publicId: "",
        authorId: user.userId,
        visibleToEmp: emp,
        visibleToManager: manager,
      };
      await uploadPost.mutateAsync(payload);
    }
  };

  return (
    <Card className="p-5 md:p-10 bg-white border-0 shadow-md">
      <h2 className="text-2xl font-bold text-gray-500 bg-white">Create Post</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="m-2">
          <label>Title</label>
          <Input
            type="txt"
            {...register("title", { required: "Title is requiered" })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>
        <div className="m-2">
          <label>Description</label>
          <Textarea {...register("description")} />
        </div>
        <div className="m-2">
          <label>tags</label>
          <Input type="text" {...register("tags")} />
        </div>
        <div className="m-2">
          <Button
            className="text-white bg-black mt-2"
            type="button"
            onClick={() => setPostType(postType === "Image" ? "Text" : "Image")}
          >
            Image Type
          </Button>
        </div>
        {postType === "Image" && (
          <div className="m-2">
            <label>Image</label>
            <Input type="File" onChange={handleFileChange} />
          </div>
        )}
        <div className="m-2 flex gap-4">
          <p>Visibal to: </p>
          <div className="">
            <input
              type="checkbox"
              id="emp"
              onChange={() => setEmp(!emp)}
              checked
            />
            <label htmlFor="emp">Employee</label>
          </div>
          <div className="">
            <input
              type="checkbox"
              id="manager"
              onChange={() => setManager(!manager)}
              checked
            />
            <label htmlFor="manager">Manager</label>
          </div>
        </div>
        <div className="m-2">
          <Button type="submit" className="bg-black text-white" disabled={(addImage.isPending || uploadPost.isPending) ? true :false}>
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
}
