import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { notify } from "@/components/custom/Notification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WarnDeleteDialogProps {
  open: boolean;
  postId: number | null;
  onClose: () => void;
  onDeleted: (postId: number) => void;
}

export default function WarnDeleteDialog({
  open,
  postId,
  onClose,
  onDeleted,
}: WarnDeleteDialogProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const warnAndDelete = useMutation({
    mutationFn: async () => {
      if (!postId) return;

      return await api.delete(`/post/warning/post/${postId}`, {
        data: {
          warnedBy: user?.userId,
          reason,
          time: new Date().toISOString(),
        },
      });
    },
    onSuccess: () => {
      notify.success("Success", "Post warned and deleted");
      if (postId) onDeleted(postId);
      onClose();
    },
    onError: (error: any) => {
      notify.error("Error", error.response?.data?.message);
    },
  });

  const handleConfirm = () => {
    if (!reason.trim()) return;
    warnAndDelete.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Warn & Delete Post</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Enter reason for inappropriate content..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={warnAndDelete.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || warnAndDelete.isPending}
          >
            {warnAndDelete.isPending ? "Deleting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}