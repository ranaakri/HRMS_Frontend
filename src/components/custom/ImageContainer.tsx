import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { TravelGallery } from "./TravelCard";
import { notify } from "./Notification";
import api from "@/api/api";

export default function ImageContainer({
  imageData,
}: {
  imageData: TravelGallery;
}) {
  const image_url = import.meta.env.VITE_IMAGE_URL;

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
    <Card className="flex items-center justify-center border-0 p-2 m-2 bg-linear-150 from-sky-500 to-sky-900">
      <div className="">
        <img
          src={image_url + "/" + imageData.filePath}
          alt="no image"
          className="h-50 w-full rounded-md border object-cover"
        />
      </div>
      <div className="">
        <Button
          variant={"destructive"}
          className="bg-red-500 hover:bg-red-800 duration-200 cursor-pointer"
          onClick={handleDelete}
        >
          delete
        </Button>
      </div>
    </Card>
  );
}
