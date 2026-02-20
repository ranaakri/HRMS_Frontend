import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { notify } from "./Notification";

interface Props {
  user: { userId: number; name: string };
  travelingUsers: any[];
  setTravelingUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AddTravelingUserDialog({
  user,
  travelingUsers,
  setTravelingUsers,
}: Props) {
  const { register, handleSubmit } = useForm({
    defaultValues: { travelBalance: 0 },
  });

  const onSubmit = (data: any) => {
    if (travelingUsers.some((u) => u.userId === user.userId)) {
      notify.info("User already added");
      return;
    }

    setTravelingUsers([
      ...travelingUsers,
      { userId: user.userId, travelBalance: data.travelBalance },
    ]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-black text-white">Add</Button>
      </DialogTrigger>

      <DialogContent className="bg-white">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="m-2 mb-4">
            <DialogTitle>Add {user.name}</DialogTitle>
          </DialogHeader>

          <Input
            type="number"
            min={0}
            {...register("travelBalance", { required: true })}
            placeholder="Travel balance"
          />

          <DialogFooter>
            <Button type="submit" className="bg-black m-4 text-white">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}