import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      setSelectedFile(file);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const addImage = useMutation({
    mutationFn: async (data: FormData) => {
      return api
        .post<DocUpload>("/doc?uploadFor=Post", data)
        .then((res) => res.data);
    },
  });

  const uploadPost = useMutation({
    mutationFn: async (data: CreatePost) => {
      return api.post("/post", data).then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Post created successfully");

      setPreviewUrl(null);
      setSelectedFile(undefined);
      setPostType("Text");
    },
    onError: (error: any) => {
      notify.error("Error", error.response?.data?.message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

      let uploadedDoc: DocUpload | null = null;

      try {
        uploadedDoc = await addImage.mutateAsync(formData);

        const payload: CreatePost = {
          title: data.title,
          description: data.description,
          tags: data.tags,
          postType: "I",
          imagePath: uploadedDoc.path,
          publicId: uploadedDoc.publicId,
          authorId: user.userId,
          visibleToEmp: emp,
          visibleToManager: manager,
        };

        await uploadPost.mutateAsync(payload);
        reset();
      } catch (error) {
        notify.error("Error", "Error while uploading post");

        if (uploadedDoc?.publicId) {
          await api.delete("/doc", {
            data: { publicId: uploadedDoc.publicId },
          });
        }
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
      reset();
    }
  };

  return (
    <Card className="p-5 md:p-10 bg-white border-0 shadow-md">
      <h2 className="text-2xl font-bold text-gray-500 bg-white">
        Create Post
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>

        <div className="m-2">
          <label>Title</label>
          <Input
            type="text"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="m-2">
          <label>Description</label>
          <Textarea {...register("description")} />
        </div>

        <div className="m-2">
          <label>Tags</label>
          <Input type="text" {...register("tags")} />
        </div>

        

        <div className="m-2 flex gap-4 items-center">
          <p>Visible to:</p>

          <div>
            <input
              type="checkbox"
              id="emp"
              checked={emp}
              onChange={() => setEmp(!emp)}
            />
            <label htmlFor="emp" className="ml-1">
              Employee
            </label>
          </div>

          <div>
            <input
              type="checkbox"
              id="manager"
              checked={manager}
              onChange={() => setManager(!manager)}
            />
            <label htmlFor="manager" className="ml-1">
              Manager
            </label>
          </div>
        </div>
        <div className="m-2">
          <Button
            className="text-white bg-black mt-2"
            type="button"
            onClick={() =>
              setPostType(postType === "Image" ? "Text" : "Image")
            }
          >
            {postType === "Image" ? "Switch to Text" : "Switch to Image"}
          </Button>
        </div>

        {postType === "Image" && (
          <div className="m-2">
            <label>Image</label>
            <Input type="file" onChange={handleFileChange} />

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="rounded-xl max-h-80 object-contain border"
                />
              </div>
            )}
          </div>
        )}

        <div className="m-2">
          <Button
            type="submit"
            className="bg-black text-white"
            disabled={addImage.isPending || uploadPost.isPending}
          >
            {addImage.isPending || uploadPost.isPending
              ? "Posting..."
              : "Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}