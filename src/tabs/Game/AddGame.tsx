import api from "@/api/api";
import { notify } from "@/components/custom/Notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export interface CreateGame {
  name: string;
  minPlayers: number;
  maxPlayers: number;
  slotDuration: number;
  openTime: string;
  closeTime: string;
  active: boolean;
}

export default function AddGame() {
  const [active, setGameActive] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGame>();

  const createGame = useMutation({
    mutationFn: async (data: CreateGame) => {
      return await api.post("/game", data);
    },
    onSuccess: () => {
      notify.success("Success", "New game created successfully");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
      return;
    },
  });

  const onSubmit = async (data: CreateGame) => {
    data.active = active;
    await createGame.mutateAsync(data);
  };

  return (
    <Card className="bg-white p-5 md:p-10 border-0 shadow-md">
      <h2 className="text-2xl font-bold text-gray-500 bg-white">Create Game</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="">
          <label htmlFor="">Game Title</label>
          <Input
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
          <label htmlFor="">Slot duration</label>
          <Input
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
          <label htmlFor="">Min Players</label>
          <Input
            type="number"
            {...register("minPlayers", {
              required: "Minimum players for the game is required",
            })}
            min={0}
            max={10}
          />
          {errors.minPlayers && (
            <p className="text-red-500 pl-2">{errors.minPlayers.message}</p>
          )}
        </div>
        <div className="">
          <label htmlFor="">Max Players</label>
          <Input
            type="number"
            {...register("maxPlayers", {
              required: "Max players for the game is required",
            })}
          />
          {errors.maxPlayers && (
            <p className="text-red-500 pl-2">{errors.maxPlayers.message}</p>
          )}
        </div>

        <div className="">
          <label htmlFor="">Opening Time</label>
          <Input
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
          <label htmlFor="">Closing Time</label>
          <Input
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
            checked
            onChange={() => setGameActive(!active)}
          />
          <label htmlFor="isActive">Active</label>
        </div>
        <div className="">
          <Button
            className="bg-black text-white"
            disabled={createGame.isPending ? true : false}
          >
            Create Game
          </Button>
        </div>
      </form>
    </Card>
  );
}
