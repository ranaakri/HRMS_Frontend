import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

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

export default function EditPost() {
  const { user } = useAuth();
  const { postId } = useParams();
  const navigate = useNavigate();

  const [postType, setPostType] = useState<"Image" | "Text">("Text");
  const [emp, setEmp] = useState(true);
  const [manager, setManager] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePost>();

  const { data: postDetails } = useQuery({
    queryKey: ["postDetails", postId],
    queryFn: async () =>
      api.get(`/post/info/${postId}`).then((res) => res.data),
    enabled: !!postId,
  });

  console.log("Post details:", postDetails);

  useEffect(() => {
    if (postDetails) {
      reset({
        title: postDetails.title,
        description: postDetails.description,
        tags: postDetails.tags,
      });

      setEmp(postDetails.visibleToEmp);
      setManager(postDetails.visibleToManager);

      if (postDetails.postType === "I") {
        setPostType("Image");
        setPreviewUrl(postDetails.imagePath);
      } else {
        setPostType("Text");
      }
    }
  }, [postDetails, reset]);

  const addImage = useMutation({
    mutationFn: async (data: FormData) =>
      api.post<DocUpload>("/doc?uploadFor=Post", data).then((res) => res.data),
  });

  const updatePost = useMutation({
    mutationFn: async (data: CreatePost) =>
      api
        .put(
          `/post/updatedBy/${user?.userId}/post/${postId}`,
          data,
        )
        .then((res) => res.data),
    onSuccess: () => {
      notify.success("Success", "Post updated successfully");
      navigate(-1);
    },
    onError: (error: any) => {
      notify.error("Error", error.response?.data?.message);
      console.error(error.response);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreatePost) => {
    if (!user) return;

    let imagePath = postDetails?.imagePath || "";
    let publicId = postDetails?.publicId || "";

    try {
      if (postType === "Image" && selectedFile) {
        const formData = new FormData();
        formData.append("doc", selectedFile);

        const uploaded = await addImage.mutateAsync(formData);
        imagePath = uploaded.path;
        publicId = uploaded.publicId;
      }

      const payload: CreatePost = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        postType: postType === "Image" ? "I" : "T",
        imagePath: postType === "Image" ? imagePath : "",
        publicId: postType === "Image" ? publicId : "",
        authorId: user.userId,
        visibleToEmp: emp,
        visibleToManager: manager,
      };

    //   console.log(payload)

      await updatePost.mutateAsync(payload);
    } catch {
      notify.error("Error", "Failed to update post");
    }
  };

  return (
    <Card className="p-6 md:p-10 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">
        Edit Post
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label>Title</label>
          <Input {...register("title", { required: "Title is required" })} />
          {errors.title && (
            <p className="text-red-500 text-sm">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label>Description</label>
          <Textarea {...register("description")} />
        </div>

        <div className="mb-4">
          <label>Tags</label>
          <Input {...register("tags")} />
        </div>

        <div className="mb-4 flex gap-4 items-center">
          <span>Visible to:</span>
          <label>
            <input
              type="checkbox"
              checked={emp}
              onChange={() => setEmp(!emp)}
            />{" "}
            Employee
          </label>
          <label>
            <input
              type="checkbox"
              checked={manager}
              onChange={() => setManager(!manager)}
            />{" "}
            Manager
          </label>
        </div>

        <div className="mb-4">
          <Button
            type="button"
            onClick={() =>
              setPostType(postType === "Image" ? "Text" : "Image")
            }
            className="bg-gray-800 text-white"
          >
            {postType === "Image"
              ? "Switch to Text"
              : "Switch to Image"}
          </Button>
        </div>

        {postType === "Image" && (
          <div className="mb-4">
            <Input type="file" onChange={handleFileChange} />

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-4 rounded-xl max-h-80 object-contain border"
              />
            )}
          </div>
        )}

        <Button
          type="submit"
          className="bg-black text-white"
          disabled={updatePost.isPending || addImage.isPending}
        >
          {updatePost.isPending ? "Updating..." : "Update Post"}
        </Button>
      </form>
    </Card>
  );
}