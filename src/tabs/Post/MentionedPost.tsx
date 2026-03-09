import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";
import type { PostResponse } from "@/components/custom/PostBox";
import PostBox from "@/components/custom/PostBox";
import InfiniteScroll from "./InfiniteScroll";
import WarnDeleteDialog from "./WarnDeleteDialog";
import LikesDialog from "./LikeDialog";
import CommentsDialog from "./CommentDialog";
import { useParams } from "react-router-dom";

export default function MentionedPost({
  myMentions,
}: {
  myMentions: boolean;
}) {
  const { user } = useAuth();

  const { userId } = useParams();

  const [page, setPage] = useState(0);
  const [postData, setPostData] = useState<PostResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [openLikes, setOpenLikes] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [warningPostId, setWarningPostId] = useState<number | null>(null);

  const loadPost = useQuery({
    queryKey: ["ListMyMentions", user?.userId, userId],
    queryFn: async () => {
      let baseEndpoint = myMentions
        ? `/post/mentions/${user?.userId}`
        : `/post/mentions/${userId}`;

      const params = new URLSearchParams({
        page: page.toString(),
      });

      const res = await api.get(`${baseEndpoint}?${params.toString()}`);
      return res.data;
    },
    enabled: !!(user?.userId || userId),
    gcTime: 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (!loadPost.data) return;

    if (loadPost.data.length === 0) {
      setHasMore(false);
    } else {
      setPostData((prev) => [...prev, ...loadPost.data]);
    }
  }, [loadPost.data]);

  const loadMore = () => {
    if (!loadPost.isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDeletePost = (postId: number) => {
    setPostData((prev) => prev.filter((p) => p.postId !== postId));
  };

  return (
    <>
      <InfiniteScroll
        data={postData}
        hasMore={hasMore}
        isLoading={loadPost.isLoading}
        loadMore={loadMore}
        message="No more posts 🎉"
        renderItem={(item: PostResponse) => (
          <PostBox
            key={item.postId}
            post={item}
            mypost={false}
            isArchived={false}
            onOpenLikes={(id) => {
              setSelectedPostId(id);
              setOpenLikes(true);
            }}
            onOpenComments={(id) => {
              setSelectedPostId(id);
              setOpenComments(true);
            }}
            onWarnRequest={(id) => {
              setWarningPostId(id);
              setOpenWarningDialog(true);
            }}
            onDelete={handleDeletePost}
            onCommentCountChange={(delta) =>
              setPostData((prev) =>
                prev.map((p) =>
                  p.postId === item.postId
                    ? { ...p, commentCount: p.commentCount + delta }
                    : p,
                ),
              )
            }
          />
        )}
      />

      <WarnDeleteDialog
        open={openWarningDialog}
        postId={warningPostId}
        onClose={() => setOpenWarningDialog(false)}
        onDeleted={handleDeletePost}
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
        onCommentCountChange={(delta: number) =>
          setPostData((prev) =>
            prev.map((p) =>
              p.postId === selectedPostId
                ? { ...p, commentCount: p.commentCount + delta }
                : p,
            ),
          )
        }
      />
    </>
  );
}
