import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/custom/Notification";

export interface Games {
  active: boolean;
  closeTime: string;
  gameId: number;
  maxPlayers: number;
  minPlayers: number;
  name: string;
  openTime: string;
  slotDuration: number;
  interested: boolean;
}

export interface GameInterest {
  userId: number;
  gameId: number;
}

export default function ListAllGames({
  activeGames,
}: {
  activeGames: boolean;
}) {
  const { user } = useAuth();
  const [gameList, setGameList] = useState<Games[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searchList, setSearchList] = useState<Games[]>([]);

  const gameListRes = useQuery({
    queryKey: ["ListGames", activeGames, user?.userId],
    queryFn: async () => {
      const endpoint = activeGames ? "/game/list/" : "/game/list-all/";
      const data = await api
        .get<Games[]>(endpoint + user?.userId)
        .then((res) => res.data);
      setGameList(data);
      return data;
    },
    enabled: !!user?.userId,
  });

  useEffect(() => {
    setSearchList(
      gameList.filter((val) =>
        val.name.toUpperCase().includes(search.toUpperCase()),
      ),
    );
  }, [search]);

  if (gameListRes.isLoading)
    return <div className="flex items-center justify-center">Loading...</div>;

  if (gameListRes.isError)
    return (
      <div className="text-red-500">Error: {gameListRes.error.message}</div>
    );

  return (
    <Card className="p-5 border-0 bg-white shadow-md">
      <h2 className="text-2xl font-bold text-gray-500 bg-white">
        {activeGames ? "Active" : "All"} Games
      </h2>
      {user?.role === "HR" && (
        <div className="">
          <Link to={"add"} className="bg-black text-white rounded-md p-2 px-4">
            Add new game
          </Link>
        </div>
      )}

      <div className="">
        <Input
          type="text"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>
      {search.length > 0 ? (
        searchList.map((item) => (
          <GamesCard
            game={item}
            active={activeGames}
            key={item.gameId + "_List"}
          />
        ))
      ) : gameList.length > 0 ? (
        gameList.map((item) => (
          <GamesCard
            game={item}
            active={activeGames}
            key={item.gameId + "_search"}
          />
        ))
      ) : (
        <div className="flex items-center justify-center text-gray-500">
          No Active games found
        </div>
      )}
    </Card>
  );
}

function GamesCard({ game, active }: { game: Games; active: boolean }) {
  const { user } = useAuth();
  console.log(game);

  const [interest, setInterest] = useState<boolean>(game.interested);

  const addAsInterest = useMutation({
    mutationFn: async (data: GameInterest) => {
      return await api.post("/game-interest", data).then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success!!", "Game is added as interest");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.log(error.response);
      return;
    },
  });

  const removeAsInterest = useMutation({
    mutationFn: async (data: GameInterest) => {
      return await api.delete("/game-interest", {data: data}).then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success!!", "Game is added as interest");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.log(error.response);
      return;
    },
  });

  const handleSetInterest = async () => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
    await addAsInterest.mutateAsync({
      userId: user?.userId,
      gameId: game.gameId,
    });
    setInterest(true);
  };

  const handleRemoveInterest = async () => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
    await removeAsInterest.mutateAsync({
      userId: user?.userId,
      gameId: game.gameId,
    });
    setInterest(false);
  };

  return (
    <Card className="bg-gray-50 border border-gray-500 shadow-md p-5 md:p-10">
      <div className="font-bold text-2xl text-gray-700">{game.name}</div>
      <div className="flex items-center gap-4">
        <p className="">
          <b>Min. Palyers:</b> {game.minPlayers}
        </p>
        <p className="">
          <b>Max. Palyers:</b> {game.maxPlayers}
        </p>
      </div>
      <div className="">
        <b>Slot Duration:</b> {game.slotDuration}
      </div>
      <div className="flex items-center gap-4">
        <p className="">
          <b>Opening Time:</b> {game.openTime}
        </p>
        <p className="">
          <b>Closing Time:</b> {game.closeTime}
        </p>
      </div>
      {active && <div className="">{game.active}</div>}
      <div className="flex gap-4">
        {user?.role === "HR" && (
          <Link
            to={`update/${game.gameId}`}
            className="bg-black text-white p-2 px-4 rounded-md"
          >
            Update Game
          </Link>
        )}
        <Link
          to={`slots/${game.gameId}`}
          className="bg-black text-white p-2 px-4 rounded-md flex items-center gap-2"
        >
          <FaBookmark />
          Book a Slot
        </Link>
        {interest ? (
          <Button
            type="button"
            className="bg-red-500 text-white p-2 py-5 rounded-md flex items-center gap-2"
            onClick={() => handleRemoveInterest()}
            disabled={addAsInterest.isPending ? true : false}
          >
            <MdAdd />
            Remove As Interested
          </Button>
        ) : (
          <Button
            type="button"
            className="bg-black text-white p-2 py-5 rounded-md flex items-center gap-2"
            onClick={() => handleSetInterest()}
            disabled={addAsInterest.isPending ? true : false}
          >
            <MdAdd />
            Add As Interst
          </Button>
        )}
      </div>
    </Card>
  );
}
