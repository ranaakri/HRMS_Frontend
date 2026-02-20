import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const DateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
};

export interface ISlots {
  slotId: number;
  startTime: string;
  endTime: string;
  status: string;
}

export default function ListGameSlots() {
  const { gameId } = useParams();
  const [gameSlotsList, setGameSlotsList] = useState<ISlots[]>([]);

  const gameSlots = useQuery({
    queryKey: ["listSlots", gameId],
    queryFn: async () => {
      const data = await api
        .get<ISlots[]>(`/game/slots/${gameId}`)
        .then((res) => res.data);
      setGameSlotsList(data);
      return data;
    },
    enabled: !!gameId,
  });

  if (gameSlots.isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (gameSlots.isError)
    return <div className="text-red-500">Error: {gameSlots.error.message}</div>;

  return (
    <Card className="bg-white p-5 md:p-10 border-0 shadow-md">
      <h2 className="text-2xl font-bold text-gray-500 bg-white">Game Slots</h2>
      <div className=""></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gameSlotsList.length > 0 ? (
          gameSlotsList.map((slot) => (
            <GameSlot key={slot.slotId + "_slot"} slot={slot} />
          ))
        ) : (
          <div className="flex items-center justify-center text-gray-500 col-span-3">
            No Slots Today...
          </div>
        )}
      </div>
    </Card>
  );
}

function GameSlot({ slot }: { slot: ISlots }) {
  return (
    <Link to={`book/${slot.slotId}`}>
      <Card
        className={`p-5 text-sm ${new Date(slot.startTime) < new Date() ? "bg-gray-300 text-black" : "bg-green-200 border-green-400"}`}
      >
        <div className="text-gray-500">
          <p className="text-center">
            {
              new Date(slot.startTime)
                .toLocaleDateString(undefined, DateOptions)
                .split(",")[1]
            }
          </p>
          <p className="text-center">to</p>
          <p className="text-center">
            {
              new Date(slot.endTime)
                .toLocaleDateString(undefined, DateOptions)
                .split(",")[1]
            }
          </p>
        </div>
        {new Date(slot.startTime) < new Date() ? (
          <Badge className="border border-black">{slot.status}</Badge>
        ) : (
          <div className=""></div>
        )}
      </Card>
    </Link>
  );
}
