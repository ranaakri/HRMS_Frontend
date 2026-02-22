import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const DateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};

export interface ISlots {
  slotId: number;
  startTime: string;
  endTime: string;
  status: "OPEN" | "PROCESSING" | "NO_BOOKING" | "BOOKED" | "LOCKED";
}

export default function ListGameSlots() {
  const { gameId } = useParams();

  const gameSlots = useQuery({
    queryKey: ["listSlots", gameId],
    queryFn: async () =>
      api.get<ISlots[]>(`/game/slots/${gameId}`).then((res) => res.data),
    enabled: !!gameId,
  });

  if (gameSlots.isLoading)
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        Loading slots...
      </div>
    );

  if (gameSlots.isError)
    return (
      <div className="text-red-500 text-center">
        Error: {gameSlots.error.message}
      </div>
    );

  return (
    <Card className="bg-white p-6 md:p-10 border-0 shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
        Game Slots
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {gameSlots.data && gameSlots.data.length > 0 ? (
          gameSlots.data.map((slot) => (
            <GameSlot key={slot.slotId} slot={slot} />
          ))
        ) : (
          <div className="flex items-center justify-center text-gray-400 col-span-3">
            No Slots Today...
          </div>
        )}
      </div>
    </Card>
  );
}

function GameSlot({ slot }: { slot: ISlots }) {
  const isPast = new Date(slot.startTime) < new Date();

  const getStatusStyles = () => {
    switch (slot.status) {
      case "OPEN":
        return "bg-green-100 text-green-700 border-green-400";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700 border-yellow-400";
      case "NO_BOOKING":
        return "bg-gray-200 text-gray-600 border-gray-400";
      case "BOOKED":
        return "bg-blue-100 text-blue-700 border-blue-400";
      case "LOCKED":
        return "bg-red-100 text-red-700 border-red-400";
      default:
        return "bg-gray-100";
    }
  };

  const cardContent = (
    <Card
      className={`p-5 rounded-xl shadow-md transition-all duration-200 
      ${
        isPast || slot.status === "LOCKED"
          ? "bg-gray-200 opacity-70"
          : "hover:shadow-xl hover:scale-[1.02] cursor-pointer"
      }`}
    >
      <div className="text-center space-y-1">
        <p className="font-semibold text-gray-700">
          {new Date(slot.startTime).toLocaleTimeString(
            undefined,
            DateOptions,
          )}
        </p>

        <p className="text-gray-400 text-xs">to</p>

        <p className="font-semibold text-gray-700">
          {new Date(slot.endTime).toLocaleTimeString(
            undefined,
            DateOptions,
          )}
        </p>
      </div>

      <div className="flex justify-center mt-4">
        <Badge
          className={`px-3 py-1 text-xs font-semibold border ${getStatusStyles()}`}
        >
          {slot.status}
        </Badge>
      </div>
    </Card>
  );

  return <Link to={`book/${slot.slotId}`}>{cardContent}</Link>;
}