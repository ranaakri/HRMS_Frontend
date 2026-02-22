import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

interface LikesResponse {
  name: string;
  userId: number;
  profileUrl: string;
}

export default function LikesDialog({
  postId,
  open,
  setOpen,
}: {
  postId: number | null;
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const likesQuery = useQuery({
    queryKey: ["likes", postId],
    queryFn: () =>
      api.get(`/post/likes/${postId}`).then((res) => res.data),
    enabled: open && !!postId,
  });

  const listOfLikers: LikesResponse[] = likesQuery.data || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>People who liked this</DialogTitle>
        </DialogHeader>

        {listOfLikers.length === 0 && (
          <p className="text-sm text-gray-500">No likes yet 👀</p>
        )}

        {listOfLikers.map((user) => (
          <div
            key={user.userId}
            className="flex gap-3 py-2 border-b items-center"
          >
            <img
              src={user.profileUrl}
              className="w-8 h-8 rounded-full"
            />
            <p className="font-semibold text-sm">{user.name}</p>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}