import { toast } from "sonner";

export const notify = {
  success: (title: string, description?: string) =>
    toast.success(title, {
      description,
      className: "bg-green-600 text-white",
    }),

  error: (title: string, description?: string) =>
    toast.error(title, {
      description,
      className: "bg-red-600 text-white",
    }),

  warning: (title: string, description?: string) =>
    toast.warning(title, {
      description,
      className: "bg-yellow-500 text-black",
    }),

  info: (title: string, description?: string) =>
    toast.info(title, {
      description,
      className: "bg-blue-600 text-white",
    }),
};