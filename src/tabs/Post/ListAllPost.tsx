import api from "@/api/api";
import type { PostResponse } from "@/components/custom/PostBox";
import PostBox from "@/components/custom/PostBox";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";
import CommentsDialog from "./CommentDialog";
import LikesDialog from "./LikeDialog";
import { useMutation } from "@tanstack/react-query";
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
import { useLocation, useParams } from "react-router-dom";

interface WarnDeleteDialogProps {
  open: boolean;
  postId: number | null;
  onClose: () => void;
  onDeleted: (postId: number) => void;
}

export default function ListAllPost({
  myPost,
  deletedPost,
}: {
  myPost: boolean;
  deletedPost?: boolean;
}) {
  const { user } = useAuth();
  const { userId } = useParams();
  const location = useLocation();

  const [page, setPage] = useState(0);
  const [postData, setPostData] = useState<PostResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [openLikes, setOpenLikes] = useState(false);
  const [openComments, setOpenComments] = useState(false);

  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [warningPostId, setWarningPostId] = useState<number | null>(null);

  const observer = useRef<IntersectionObserver | null>(null); 

  const loadPost = useQuery({
    queryKey: [
      myPost ? "loadMyPost" : "loadFilteredPost",
      page,
      user?.userId,
      userId,
      location.pathname
    ],
    queryFn: () =>
      api
        .get(
          userId
            ? `/post/my/${userId}?page=${page}`
            : deletedPost
              ? `/api/post/warning/hr/{userId}?page=${page}`
              : myPost
                ? `/post/my/${user?.userId}?page=${page}`
                : user?.role === "HR"
                  ? `/post/${user?.userId}?page=${page}`
                  : `/post/filtered/${user?.userId}?page=${page}`,
        )
        .then((res) => res.data),
    enabled: !!user?.userId,
  });

  useEffect(() => {
    setPage(0);
    setPostData([]);
    setHasMore(true);
  }, [myPost]);

  useEffect(() => {
    setPage(0);
    setPostData([]);
    setHasMore(true);
  }, [location.pathname]);

  useEffect(() => {
    if (loadPost.data) {
      if (loadPost.data.length === 0) {
        setHasMore(false);
      } else {
        setPostData((prev) => [...prev, ...loadPost.data]);
      }
    }
  }, [loadPost.data]);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadPost.isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadPost.isLoading, hasMore],
  );

  const handleDeletePost = (postId: number) => {
    setPostData((prev) => prev.filter((p) => p.postId !== postId));
  };

  return (
    <div>
      {postData.map((item, index) => {
        const isLast = index === postData.length - 1;

        const postComponent = (
          <PostBox
            key={item.postId}
            post={item}
            onOpenLikes={(id: number) => {
              setSelectedPostId(id);
              setOpenLikes(true);
            }}
            onWarnRequest={(id) => {
              setWarningPostId(id);
              setOpenWarningDialog(true);
            }}
            onOpenComments={(id: number) => {
              setSelectedPostId(id);
              setOpenComments(true);
            }}
            mypost={myPost}
            onDelete={handleDeletePost}
            onCommentCountChange={(delta: number) => {
              setPostData((prev) =>
                prev.map((p) =>
                  p.postId === item.postId
                    ? { ...p, commentCount: p.commentCount + delta }
                    : p,
                ),
              );
            }}
          />
        );

        if (isLast) {
          return (
            <div ref={lastPostRef} key={item.postId}>
              {postComponent}
            </div>
          );
        }

        return postComponent;
      })}

      <WarnDeleteDialog
        open={openWarningDialog}
        postId={warningPostId}
        onClose={() => setOpenWarningDialog(false)}
        onDeleted={(postId) => handleDeletePost(postId)}
      />

      <LikesDialog
        postId={selectedPostId}
        open={openLikes}
        setOpen={setOpenLikes}
      />

      <CommentsDialog
        postId={selectedPostId}
        open={openComments}
        setOpen={setOpenComments}
        onCommentCountChange={(delta: any) => {
          setPostData((prev) =>
            prev.map((p) =>
              p.postId === selectedPostId
                ? { ...p, commentCount: p.commentCount + delta }
                : p,
            ),
          );
        }}
      />

      {loadPost.isLoading && (
        <div className="flex justify-center py-4">Loading...</div>
      )}

      {!hasMore && (
        <div className="text-center text-gray-400 py-4">No more posts 🎉</div>
      )}
    </div>
  );
}

function WarnDeleteDialog({
  open,
  postId,
  onClose,
  onDeleted,
}: WarnDeleteDialogProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
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
      if (postId) {
        onDeleted(postId);
      }
      onClose();
    },
    onError: (error: any) => {
      notify.error("Error", error.response?.data?.message);
      console.error(error.response);
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
