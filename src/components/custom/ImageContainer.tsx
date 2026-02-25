import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { TravelGallery } from "./TravelCard";
import { notify } from "./Notification";
import api from "@/api/api";
import { MdDelete } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { useConfirm } from "@/hooks/usecontirm";

export default function ImageContainer({
  imageData,
  onRemove,
}: {
  imageData: TravelGallery;
  onRemove: () => void;
}) {

  const { confirm, ConfirmComponent } = useConfirm();

  const deleteImage = useMutation({
    mutationFn: async () =>
      await api.delete(`/travel/gallery/${imageData.imageId}`),
    onSuccess: () => {
      notify.success("Image deleted");
      onRemove();
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const handleDelete = async () => {
    const res = await confirm("Do you want to delete this image?");
    if (res) {
      await deleteImage.mutateAsync();
    }
  };

  console.log("Image data: ", imageData);

  return (
    <Card className="flex items-center justify-center border-0 p-2 m-2 bg-gray-200 shadow-md">
      <div className="relative">
        <a target="_blank" href={imageData.filePath}>
          <img
            src={imageData.filePath}
            alt="no image"
            className="h-50 w-full rounded-md border object-cover"
          />
        </a>
        <Button
          variant={"destructive"}
          className="bg-red-400 border-red-600 hover:bg-red-600 duration-200 cursor-pointer absolute top-2 end-2 rounded-full"
          onClick={handleDelete}
        >
          <MdDelete />
        </Button>
      </div>
      {ConfirmComponent}
    </Card>
  );
}
