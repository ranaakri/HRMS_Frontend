import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import { FaBookmark, FaRegStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/custom/Notification";
import { useConfirm } from "@/hooks/usecontirm";

export interface Games {
  active: boolean;
  closeTime: string;
  gameId: number;
  maxPlayers: number;
  minPlayers: number;
  name: string;
  openTime: string;
  slotDuration: number;
  favourite: boolean;
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
  const [search, setSearch] = useState<string>("");
  const {
    data: gameList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ListGames", activeGames, user?.userId],
    queryFn: async () => {
      const endpoint = activeGames ? "/game/list/" : "/game/list-all/";
      const res = await api.get<Games[]>(endpoint + user?.userId);
      return res.data;
    },
    enabled: !!user?.userId,
  });

  const filteredGames = gameList.filter((val) =>
    val.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse">Loading games...</div>
    );
  if (isError)
    return (
      <div className="p-10 text-red-500 text-center">
        Error: {error.message}
      </div>
    );

  return (
    <Card className="p-6 border-none shadow-lg bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4">
        <Input
          type="text"
          placeholder="Search games by name..."
          className="max-w-sm"
          onChange={(e) => setSearch(e.target.value)}
        />
        {user?.role === "HR" && (
          <Link
            to="add"
            className="border inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <MdAdd className="mr-2 h-4 w-4" /> Add New Game
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((item) => (
            <GamesCard game={item} key={item.gameId} />
          ))
        ) : (
          <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No games found matching your criteria.
          </div>
        )}
      </div>
    </Card>
  );
}

function GamesCard({ game }: { game: Games; }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(game.favourite);
  const { confirm, ConfirmComponent } = useConfirm();

  const [interest, setInterest] = useState<boolean>(game.interested);

  const addAsInterest = useMutation({
    mutationFn: async (data: GameInterest) => {
      return await api.post("/game-interest", data).then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success!!", "Game is added as interest");
      setFav(true)
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
      return await api
        .delete("/game-interest", { data: data })
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Success!!", "Game is removed from interest");
      setFav(false)
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.log(error.response);
      return;
    },
  });

  const addGameAsFav = useMutation({
    mutationFn: async () => {
      return await api.patch(
        `/users/fav-game/user/${user?.userId}/game/${game.gameId}`,
      );
    },
    onSuccess: () => {
      setFav(true);
      notify.success("Game added as favourate");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const removeGameAsFav = useMutation({
    mutationFn: async () => {
      return await api.delete(
        `/users/fav-game/user/${user?.userId}/game/${game.gameId}`,
      );
    },
    onSuccess: () => {
      setFav(false);
      notify.success("Game removed as favourate");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
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
    if (
      !(await confirm(
        "Are you sure you want to remove this game from interest ?",
      ))
    )
      return;
    removeAsInterest.mutateAsync({
      userId: user?.userId,
      gameId: game.gameId,
    });
    setInterest(false);
  };

  return (
    <Card className="p-5 hover:border-primary/50 transition-colors shadow-sm border-gray-200">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            {fav ? (
              <Button
                variant="secondary"
                className="bg-amber-100 text-amber-700 size-0.5 text-sm border-amber-500"
                onClick={async () => await removeGameAsFav.mutateAsync()}
              >
                <FaRegStar className="size-3" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="bg-white text-black size-0.5 text-sm"
                onClick={async () => await addGameAsFav.mutateAsync()}
              >
                <FaRegStar className="size-3" />
              </Button>
            )}
            <h3 className="text-xl font-bold text-foreground">{game.name}</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Players</p>
              <p className="font-medium">
                {game.minPlayers} - {game.maxPlayers}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{game.slotDuration} mins</p>
            </div>
            <div>
              <p className="text-muted-foreground">Opening</p>
              <p className="font-medium">{game.openTime}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Closing</p>
              <p className="font-medium">{game.closeTime}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button variant="outline" asChild size="sm">
            <Link to={`slots/${game.gameId}`}>
              <FaBookmark className="mr-2 h-3 w-3" /> Book Slot
            </Link>
          </Button>

          {interest ? (
            <Button
              variant="destructive"
              className="text-red-500 bg-red-200 border border-red-500"
              size="sm"
              onClick={() => handleRemoveInterest()}
            >
              Remove Interest
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSetInterest()}
            >
              Add Interest
            </Button>
          )}

          {user?.role === "HR" && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={`update/${game.gameId}`}>Update</Link>
            </Button>
          )}
        </div>
      </div>
      {ConfirmComponent}
    </Card>
  );
}
