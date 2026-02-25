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
    user?.profileUrl || null
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
      return await api.patch(`/users/${user?.userId}`, data).then((res) => res.data);
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
        error.response?.data?.message || "Failed to update profile"
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
    <div className="flex justify-center items-center w-full">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-linear-to-br from-black/80 to-blue-500 border border-gray-800 text-white">
        <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-cyan-300">
          Update Profile
        </h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-lg shadow-blue-500/20 group">
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
            className="mt-3 text-sm text-blue-300 cursor-pointer hover:text-blue-200 transition-colors"
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Full Name
            </label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={uploadImage.isPending || updateUser.isPending}
            className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 transform hover:scale-[1.02]"
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