import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { TravelGallery } from "./TravelCard";
import { notify } from "./Notification";
import api from "@/api/api";
import { MdDelete } from "react-icons/md";

export default function ImageContainer({
  imageData,
}: {
  imageData: TravelGallery;
}) {

  const handleDelete = async () => {
    try {
      const res = confirm("Do you want to delete this image?");
      if (res === true) {
        await api.delete(`/travel/gallery/${imageData.imageId}`, {
          withCredentials: true,
        });
        notify.success("Image deleted");
      }
    } catch (error: any) {
      console.log(error.message);
      notify.error("Error", error.message);
    }
  };

  return (
    <Card className="flex items-center justify-center border-0 p-2 m-2 bg-gray-200 shadow-md">
      <div className="relative">
        <a target="_blank"
        href={imageData.filePath}
        >
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
      
    </Card>
  );
}
