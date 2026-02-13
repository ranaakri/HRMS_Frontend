import { Card } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Root {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  status: string;
  assignedBudget: number;
  totalExpense: number;
  createdById: number;
  travelId: number;
  travelGallery: TravelGallery[];
  createdByUser: CreatedByUser;
}

export interface TravelGallery {
  imageId: number;
  filePath: string;
  uploadedAt: string;
}

export interface CreatedByUser {
  userId: number;
  name: string;
  email: string;
}

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TravelCard({ details }: { details: Root }) {
  const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-black text-white group transition-all hover:shadow-xl max-w-4xl mx-auto m-4 border-gray-500">
      <div className="flex flex-col md:flex-row">
        <div className=" md:w-2/5 relative bg-slate-100 m-4 rounded-md">
          {details.travelGallery.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent className="">
                {details.travelGallery.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center"
                  >
                    <img
                      src={`${imageBaseUrl}/${item.filePath}`}
                      alt={details.title}
                      className="w-full h-50 md:h-50 object-cover rounded-md"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden group-hover:block text-black font-bold">
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </div>
            </Carousel>
          ) : (
            <div className="w-full h-64 md:h-full flex items-center justify-center bg-sky-50 text-sky-300 rounded-md">
              No Images
            </div>
          )}
          <Badge className="absolute top-4 left-4 bg-sky-500 hover:bg-sky-600 border-none">
            {details.status}
          </Badge>
        </div>

        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {details.title}
            </h2>
            <p className="text-slate-200 line-clamp-3 text-sm leading-relaxed">
              {details.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center text-xs text-slate-100 gap-1 uppercase font-semibold">
                <CalendarDays className="w-3 h-3" /> Timeline
              </div>
              <p className="text-xs font-medium text-slate-400">
                {formatDate(details.startDate)} - {formatDate(details.endDate)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-slate-100 gap-1 uppercase font-semibold">
                <Wallet className="w-3 h-3" /> Budget (Used/Total)
              </div>
              <p className="text-xs font-medium text-slate-400">
                {details.totalExpense} Rs. / {details.assignedBudget} Rs.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-100 leading-none">
                  {details.createdByUser.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {details.createdByUser.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              className="p-2 bg-white text-black rounded-md cursor-pointer"
              onClick={() => navigate(`manage/update/${details.travelId}`)}
            >
              Update
            </button>
            <button
              className="p-2 bg-white text-black rounded-md cursor-pointer"
              onClick={() =>
                navigate(`manage/add-traveler/${details.travelId}`)
              }
            >
              Add Traveling Persons
            </button>
             <button
              className="p-2 bg-white text-black rounded-md cursor-pointer"
              onClick={() =>
                navigate(`manage/upload-documents/${details.travelId}`)
              }
            >
              Upload Documents
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
