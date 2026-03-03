import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";

interface UpdateProfileForm {
  name: string;
  email: string;
  profileUrl: string;
  publicId: string;
}

interface DocUpload {
  path: string;
  publicId: string;
}

export default function UpdateProfile() {
  const { user, setUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profileUrl || null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileForm>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setPreviewUrl(user.profileUrl);
    }
  }, [user, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = useMutation({
    mutationFn: async (formData: FormData) => {
      return await api
        .post<DocUpload>("/doc?uploadFor=Profile", formData)
        .then((res) => res.data);
    },
  });

  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      return await api
        .patch(`/users/${user?.userId}`, data)
        .then((res) => res.data);
    },
    onSuccess: (data) => {
      notify.success("Success", "Profile updated successfully");
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
    onError: (error: any) => {
      notify.error(
        "Error",
        error.response?.data?.message || "Failed to update profile",
      );
    },
  });

  const onSubmit = async (data: UpdateProfileForm) => {
    if (!user) return;

    let profileUrl = user.profileUrl;
    let publicId;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("doc", selectedFile);
        const uploadRes = await uploadImage.mutateAsync(formData);
        profileUrl = uploadRes.path;
        publicId = uploadRes.publicId;
      }

      const payload = {
        ...data,
        publicId,
        profileUrl,
      };

      await updateUser.mutateAsync(payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-full p-4">
      <Card className="w-full p-8 rounded-md shadow-sm bg-white border border-gray-200 text-black grid grid-cols-1 md:grid-cols-2">
        <div className="">
          <h2 className="text-2xl font-bold text-center mb-8 text-black">
            Update Profile
          </h2>

          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200 group">
              <img
                src={
                  previewUrl ||
                  "https://betterwaterquality.com/wp-content/uploads/2020/09/dummy-profile-pic-300x300-1-1.png"
                }
                alt="Profile Preview"
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </div>
            <label
              htmlFor="profile-upload"
              className="mt-3 text-sm text-gray-600 cursor-pointer hover:text-black transition-colors underline underline-offset-4"
            >
              Change Profile Photo
            </label>
            <Input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:ring-black"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-600 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:ring-black"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-600 text-xs">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={uploadImage.isPending || updateUser.isPending}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-md transition-all duration-200"
          >
            {uploadImage.isPending || updateUser.isPending
              ? "Updating..."
              : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
