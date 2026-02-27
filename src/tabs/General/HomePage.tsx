import api from "@/api/api";
import type { ApiError } from "@/api/axiosError";
import BirthdayMessage from "@/components/custom/BirthdayMessage";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { GameSlot, type ISlots } from "../Game/ListGameSlots";
import { Link } from "react-router-dom";
import type { ITravelDetails } from "../HR/UpdateTravel";
import TravelCard from "@/components/custom/TravelCard";
import { FaCalendarAlt, FaBirthdayCake, FaGamepad, FaPlaneDeparture } from "react-icons/fa";

interface BirthdayMessageResponse {
  name: string;
  profileUrl: string;
}

interface FavGame {
  name: string;
  gameId: number;
  upComingSlots: ISlots[];
}

export default function HomePage() {
  const { user } = useAuth();

  const birthday = useQuery<BirthdayMessageResponse[]>({
    queryKey: ["Birthday"],
    queryFn: () => api.get("/users/birthday").then((res) => res.data),
  });

  const gameSlots = useQuery<FavGame, ApiError>({
    queryKey: ["favGameSltos", user?.userId],
    queryFn: () =>
      api.get(`/users/game/${user?.userId}`).then((res) => res.data),
    enabled: !!user?.userId,
  });

  const travelPlan = useQuery<ITravelDetails>({
    queryKey: ["getTravelPlan", user?.userId],
    queryFn: () =>
      api
        .get(`/travel/traveling-user/nearest/${user?.userId}`)
        .then((res) => res.data),
    enabled: !!user?.userId,
  });

  const birthdayData = birthday.data || [];

  if (birthday.isLoading)
    return (
      <div className="flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  if (birthday.isError)
    return <div className="text-red-500">Error: {birthday.error.message}</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-xl border-0 shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaBirthdayCake className="text-amber-500 size-6" />
            <h2 className="font-bold text-2xl text-gray-800">Today's Birthdays</h2>
          </div>
          <Link 
            to={"calendar-events"} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-gray-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
          >
            <FaCalendarAlt /> <span>View Bookings</span>
          </Link>
        </div>

        {birthdayData.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {birthdayData.map((item, index) => (
              <BirthdayMessage
                name={item.name}
                profileUrl={item.profileUrl}
                key={index}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            No birthdays today.
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-xl border-0 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaGamepad className="text-emerald-500 size-6" />
            <h2 className="font-bold text-xl text-gray-800">Favorite Game: {gameSlots.data?.name || "Slots"}</h2>
          </div>
          
          {gameSlots.isError ? (
            <div className="py-10 text-center text-gray-400">{gameSlots.error.response?.data.message}</div>
          ) : gameSlots.isLoading ? (
            <div className="py-10 text-center text-gray-400">Loading slots...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameSlots.data?.upComingSlots.length ? (
                gameSlots.data.upComingSlots.map((item) => (
                  <Link
                    to={`../game/slots/${gameSlots.data.gameId}/book/${item.slotId}`}
                    key={item.slotId}
                    className="transform hover:scale-[1.02] transition-transform"
                  >
                    <GameSlot slot={item} disable={true} />
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-400">No upcoming slots.</div>
              )}
            </div>
          )}
        </Card>

        <Card className="bg-white rounded-xl border-0 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FaPlaneDeparture className="text-blue-500 size-6" />
            <h2 className="font-bold text-xl text-gray-800">Upcoming Travel</h2>
          </div>
          
          {!!travelPlan.data ? (
            <div className="-mx-4">
              <TravelCard
                details={travelPlan.data}
                expense={true}
                myTarvelPlan={false}
                homePage={true}
              />
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              No active travel plans found.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
