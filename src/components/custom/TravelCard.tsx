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
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { notify } from "./Notification";

export interface TravelPlanResponse {
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

export default function TravelCard({
  details,
  expense,
  myTarvelPlan,
}: {
  details: TravelPlanResponse;
  expense: boolean;
  myTarvelPlan: boolean;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
  }, []);

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white text-black m-4 group transition-all hover:shadow-xl max-w-4xl mx-4 border-gray-500">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/5 relative m-4 rounded-md flex items-center">
          {details.travelGallery.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {details.travelGallery.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center"
                  >
                    <img
                      src={`${item.filePath}`}
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
            <h2 className="text-2xl font-bold text-black mb-2">
              {details.title}
            </h2>
            <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed">
              {details.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center text-xs text-slate-700 gap-1 uppercase font-semibold">
                <CalendarDays className="w-3 h-3" /> Timeline
              </div>
              <p className="text-xs font-medium text-slate-400">
                {formatDate(details.startDate)} - {formatDate(details.endDate)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-xs text-slate-700 gap-1 uppercase font-semibold">
                <Wallet className="w-3 h-3" /> Budget (Used/Total)
              </div>
              <p className="text-xs font-medium text-slate-400">
                {details.totalExpense} Rs. / {details.assignedBudget} Rs.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {/* <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 leading-none">
                  {details.createdByUser.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {details.createdByUser.email}
                </span>
              </div>
            </div> */}
          </div>
          <div className="">
            {user?.role === "HR" && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <Link
                  className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                  to={`${myTarvelPlan ? "../../" : ""}manage/update/${details.travelId}`}
                >
                  Update
                </Link>
                <Link
                  className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                  to={`${myTarvelPlan ? "../../" : ""}manage/add-traveler/${details.travelId}`}
                >
                  Traveling Persons
                </Link>
                <Link
                  className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                  to={`${myTarvelPlan ? "../../" : ""}manage/upload-documents/${details.travelId}`}
                >
                  Upload Documents
                </Link>
                {!expense && (
                  <Link
                    className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                    to={`manage/expense-approval/${details.travelId}`}
                  >
                    Approve Expense
                  </Link>
                )}
                {expense && (
                  <Link
                    className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                    to={`expense/${details.travelId}`}
                  >
                    Manage Expense
                  </Link>
                )}
              </div>
            )}
            {user?.role === "Employee" && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <Link
                  className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                  to={`manage/expense/${details.travelId}`}
                >
                  Manage Expense
                </Link>
                <Link
                  className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                  to={`manage/upload-documents/${details.travelId}`}
                >
                  Upload Document
                </Link>
              </div>
            )}
            {user?.role === "Manager" && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                {!expense && (
                  <Link
                    className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                    to={`/manager/travel/manage/traveling-users/${details.travelId}`}
                  >
                    Traveling Users
                  </Link>
                )}
                {expense && (
                  <Link
                    className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                    to={`../upload-documents/${details.travelId}`}
                  >
                    Upload Document
                  </Link>
                )}
                {expense && (
                  <Link
                    className="p-2 bg-black text-white rounded-md cursor-pointer flex items-center justify-center"
                    to={`expense/${details.travelId}`}
                  >
                    Manage Expense
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
