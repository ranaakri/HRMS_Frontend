import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    queryFn: () => api.get(`/post/likes/${postId}`).then((res) => res.data),
    enabled: open && !!postId,
  });

  const listOfLikers: LikesResponse[] = likesQuery.data || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white w-full max-w-md p-0 rounded-xl overflow-hidden">
        <div className="max-h-[80vh] flex flex-col">
         
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
            <DialogTitle className="text-lg font-semibold">
              People who liked this
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1">
            {listOfLikers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">
                No likes yet 👀
              </p>
            )}

            {listOfLikers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-100 transition"
              >
                <img
                  src={user.profileUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <p className="font-medium text-sm">{user.name}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
