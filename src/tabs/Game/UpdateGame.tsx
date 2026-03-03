import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

export interface UpdateGame {
  name: string;
  minPlayers: number;
  maxPlayers: number;
  slotDuration: number;
  openTime: string;
  closeTime: string;
  active: boolean;
}

export default function UpdateGame() {
  const { gameId } = useParams();

  const [active, setActive] = useState(true);

  const game = useQuery({
    queryKey: ["getGameData", gameId],
    queryFn: () =>
      api
        .get(`/game/${gameId}`)
        .then((res) => res.data)
        .catch(() => notify.error("Error", "Failed to fetch users")),
  });

  useEffect(() => {
    if(game.data){
        setActive(game.data.active)
    }
  }, [game.data])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateGame>({ values: game.data });

  const updateGame = useMutation({
    mutationFn: async (data: UpdateGame) => {
      return await api.put(`/game/${game.data.gameId}`, data);
    },
    onSuccess: () => {
      notify.success("Success", "Game updated Successfully");
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const onSubmit = async (data: UpdateGame) => {
    data.active = active;
    await updateGame.mutateAsync(data);
  };

  return (
    <Card className="bg-white p-5 md:p-10 border-0 shadow-md">
      <h2 className="text-2xl font-bold text-gray-500 bg-white">Update Game</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4"
      >
        <div className="">
          <label htmlFor="title">Game Title</label>
          <Input
          id="title"
            type="text"
            {...register("name", {
              required: "Game Title is required",
            })}
          />
          {errors.name && (
            <p className="text-red-500 pl-2">{errors.name.message}</p>
          )}
        </div>
        <div className="">
          <label htmlFor="slot-duration">Slot duration</label>
          <Input
          id="slot-duration"
            type="number"
            {...register("slotDuration", {
              required: "Slot duration is required",
            })}
            min={10}
            max={60}
          />
          {errors.slotDuration && (
            <p className="text-red-500 pl-2">{errors.slotDuration.message}</p>
          )}
        </div>
        <div className="">
          <label htmlFor="min-players">Min Players</label>
          <Input
            type="number"
            {...register("minPlayers", {
              required: "Minimum players for the game is required",
            })}
            id="min-palyers"
            min={0}
            max={10}
          />
          {errors.minPlayers && (
            <p className="text-red-500 pl-2">{errors.minPlayers.message}</p>
          )}
        </div>
        <div className="">
          <label htmlFor="max-players">Max Players</label>
          <Input
            type="number"
            {...register("maxPlayers", {
              required: "Max players for the game is required",
            })}
            id="max-players"
          />
          {errors.maxPlayers && (
            <p className="text-red-500 pl-2">{errors.maxPlayers.message}</p>
          )}
        </div>

        <div className="">
          <label htmlFor="opening-time">Opening Time</label>
          <Input
          id="opening-time"
            type="time"
            {...register("openTime", {
              required: "Opening time of the game is required",
            })}
          />
          {errors.openTime && (
            <p className="text-red-500 pl-2">{errors.openTime.message}</p>
          )}
        </div>
        <div className="">
          <label htmlFor="close-time">Closing Time</label>
          <Input
          id="close-time"
            type="time"
            {...register("closeTime", {
              required: "Closing time for the game is required",
            })}
          />
          {errors.closeTime && (
            <p className="text-red-500 pl-2">{errors.closeTime.message}</p>
          )}
        </div>
        <div className="flex items-center gap-4 col-span-2">
          <input
            type="checkbox"
            id="isActive"
            checked={active}
            onChange={() => setActive(!active)}
          />
          <label htmlFor="isActive">Active</label>
        </div>
        <div className="flex gap-4">
          <Button
            className="bg-black text-white"
            disabled={updateGame.isPending}
          >
            Update Game
          </Button>
        </div>
      </form>
    </Card>
  );
}
