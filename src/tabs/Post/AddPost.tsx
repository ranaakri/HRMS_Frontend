import api from "@/api/api";
import type { IUserList } from "@/components/custom/AddUserToTravel";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hook/DebounceHoot";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";

export interface CreatePost {
  title: string;
  description: string;
  tags: string;
  postType: string;
  imagePath: string;
  publicId: string;
  mentions: number[];
  authorId: number;
  visibleToManager: boolean;
  visibleToEmp: boolean;
}

export interface DocUpload {
  path: string;
  publicId: string;
}

export interface User {
  userId: number;
  name: string;
  email: string;
}

export default function CreatePost() {
  const { user } = useAuth();

  const [postType, setPostType] = useState<"Image" | "Text">("Text");
  const [emp, setEmp] = useState(true);
  const [manager, setManager] = useState(true);

  const [mentions, setMention] = useState<User[]>([]);

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
      setMention([]);
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
          mentions: mentions.map((val) => val.userId),
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
        mentions: mentions.map((val) => val.userId),
      };

      await uploadPost.mutateAsync(payload);
      reset();
    }
  };

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full max-w-2xl p-6 md:p-8 bg-white shadow-lg rounded-2xl border">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Create Post
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setPostType("Text")}
              className={`px-4 py-1.5 rounded-md text-sm transition ${
                postType === "Text"
                  ? "bg-white shadow text-black"
                  : "text-gray-500"
              }`}
            >
              Text
            </button>

            <button
              type="button"
              onClick={() => setPostType("Image")}
              className={`px-4 py-1.5 rounded-md text-sm transition ${
                postType === "Image"
                  ? "bg-white shadow text-black"
                  : "text-gray-500"
              }`}
            >
              Image
            </button>
          </div>

          <div>
            <Input
              placeholder="Write a title..."
              className="border-0 border-b rounded-none focus-visible:ring-0 text-lg"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Write your caption..."
              className="resize-none min-h-25 border rounded-xl"
              {...register("description")}
            />
          </div>

          <Input
            placeholder="Add tags (e.g. travel, work, tech)"
            className="rounded-xl"
            {...register("tags")}
          />

          {postType === "Image" && (
            <div className="space-y-4">
              <label
                htmlFor="uploadimg"
                className="block text-sm text-gray-500"
              >
                Upload Image
              </label>

              <Input type="file" id="uploadimg" onChange={handleFileChange} />

              {previewUrl && (
                <div className="rounded-xl overflow-hidden border bg-gray-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-100 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Visibility */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
            <span className="text-sm font-medium text-gray-700">
              Visible To
            </span>

            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emp}
                  onChange={() => setEmp(!emp)}
                />
                Employee
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manager}
                  onChange={() => setManager(!manager)}
                />
                Manager
              </label>
            </div>
          </div>

          <div className="">
            <AddUserToMention mentions={mentions} setMention={setMention} />
          </div>

          <Button
            type="submit"
            disabled={addImage.isPending || uploadPost.isPending}
            className="w-full bg-black text-white rounded-xl h-11 text-sm font-medium hover:opacity-90 transition"
          >
            {addImage.isPending || uploadPost.isPending
              ? "Posting..."
              : "Share Post"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function AddUserToMention({
  mentions,
  setMention,
}: {
  mentions: User[];
  setMention: Dispatch<SetStateAction<User[]>>;
}) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [userList, setUserList] = useState<IUserList[]>([]);

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
  }, [user]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }

    if (debouncedSearch.length < 2) {
      setUserList([]);
      return;
    }

    api
      .get(`/users/list?name=${debouncedSearch}`)
      .then((res) =>
        setUserList(res.data.filter((val: any) => val.userId != user.userId)),
      )
      .catch(() => notify.error("Error", "Failed to fetch users"));
  }, [debouncedSearch]);

  const handleRemoveGamePartner = (userId: number) => {
    if (userId === user?.userId) {
      notify.error("Error", "Can not remove your self from game");
      return;
    }
    setMention((prev) => prev.filter((val) => val.userId != userId));
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search partners by name..."
        value={search}
        className="bg-white border-gray-200 focus:ring-black"
        onChange={(e) => setSearch(e.target.value)}
      />

      {userList.map((user) => (
        <Card
          key={user.userId}
          className="p-3 flex flex-row justify-between items-center bg-white border-gray-100 hover:border-black transition-all"
        >
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="cursor-pointer hover:bg-black hover:text-white"
            onClick={() => {
              if (mentions.some((val) => val.userId === user.userId)) {
                notify.error("Error", "Users has been already added");
                return;
              }
              setMention((prev) => [...prev, user]);
              setSearch("");
            }}
            type="button"
          >
            Add
          </Button>
        </Card>
      ))}

      {mentions.length > 0 && (
        <div>
          <h3 className="font-bold text-lg">Mentions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {mentions.map((u) => (
              <Button
                className="text-blue-700 border-blue-500 border"
                onClick={() => handleRemoveGamePartner(u.userId)}
                type="button"
              >
                @{u.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
