import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/custom/Notification";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { useState } from "react";

interface CommentResponse {
  commentId: number;
  commentText: string;
  commentedAt: string;
  commentedBy: {
    name: string;
    profileUrl: string;
    userId: number;
  };
}

interface AddComment {
  commentText: string;
  commentedById: number;
  commentedAt: string;
  postId: number;
}

interface Props {
  postId: number | null;
  open: boolean;
  setOpen: (val: boolean) => void;
  onCommentCountChange: (delta: number) => void;
}

export default function CommentsDialog({
  postId,
  open,
  setOpen,
  onCommentCountChange,
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const commentsQuery = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.get(`/post/comments/${postId}`).then((res) => res.data),
    enabled: open && !!postId,
  });

  const listOfComments: CommentResponse[] = commentsQuery.data || [];

  const addComment = useMutation({
    mutationFn: async (data: AddComment) =>
      await api.post(`/post/comment`, data).then((res) => res.data),
    onSuccess: () => {
      notify.success("Comment added", "Comment Added Successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      onCommentCountChange(1);
      setCommentText("");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (data: { commentedById: number; commentId: number }) =>
      await api.delete(`/post/comment`, { data }),
    onSuccess: () => {
      notify.success("Deleted", "Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      onCommentCountChange(-1);
    },
  });

  const editComment = useMutation({
    mutationFn: async (data: {
      commentId: number;
      editedBy: number;
      commentText: string;
      updatedAt: string;
    }) => await api.put(`/post/comment`, data).then((res) => res.data),

    onSuccess: () => {
      notify.success("Updated", "Comment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error: any) => {
      notify.error("Error", error.response.data.message);
      console.error(error.response);
    },
  });

  const handleAdd = async () => {
    if (!user || !postId) return;

    if(commentText && commentText.trim().length <= 0){
        notify.error("Error", "Comment can not be empty")
        return;
    }

    const payload: AddComment = {
      commentText,
      commentedById: user.userId,
      commentedAt: new Date().toISOString(),
      postId,
    };

    await addComment.mutateAsync(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Comment..."
            maxLength={200}
            required
          />
          <Button onClick={handleAdd} disabled={addComment.isPending}>
            Send
          </Button>
        </div>

        {listOfComments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet 💬</p>
        )}

        {listOfComments.map((comment) => (
          <CommentItem
            key={comment.commentId}
            comment={comment}
            currentUserId={user?.userId}
            onDelete={(commentId) =>
              deleteComment.mutate({
                commentedById: user!.userId,
                commentId,
              })
            }
            onEdit={(data) => editComment.mutate(data)}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onEdit,
}: {
  comment: CommentResponse;
  currentUserId?: number;
  onDelete: (commentId: number) => void;
  onEdit: (data: {
    commentId: number;
    editedBy: number;
    commentText: string;
    updatedAt: string;
  }) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.commentText);

  const handleSave = () => {

    if(editText && editText.trim().length <= 0){
        notify.error("Error", "Comment can not be empty")
        return;
    }

    onEdit({
      commentId: comment.commentId,
      editedBy: currentUserId!,
      commentText: editText,
      updatedAt: new Date().toISOString(),
    });

    setIsEditing(false);
  };

  return (
    <div className="flex gap-3 py-3 border-b">
      <img
        src={comment.commentedBy.profileUrl}
        className="w-8 h-8 rounded-full object-cover"
      />

      <div className="flex-1">
        <p className="font-semibold text-sm">{comment.commentedBy.name}</p>

        {isEditing ? (
          <div className="flex gap-2 mt-1">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              required
            />
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-700">{comment.commentText}</p>
        )}
      </div>

      {comment.commentedBy.userId === currentUserId && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-red-500"
            onClick={() => onDelete(comment.commentId)}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
