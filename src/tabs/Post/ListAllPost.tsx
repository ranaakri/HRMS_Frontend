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

interface PostFetcherProps {
  readonly myPost: boolean;
  readonly deletedPost?: boolean;
  readonly userIdFilter?: number | null;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly tags?: string | null;
}

export default function ListAllPost({
  myPost,
  tags,
  deletedPost,
  userIdFilter,
  startDate,
  endDate,
}: PostFetcherProps) {
  const { user } = useAuth();

  const [page, setPage] = useState(0);
  const [postData, setPostData] = useState<PostResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [openLikes, setOpenLikes] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [warningPostId, setWarningPostId] = useState<number | null>(null);

  const loadPost = useQuery({
    queryKey: [
      "posts",
      page,
      myPost,
      deletedPost,
      userIdFilter,
      startDate,
      endDate,
      user?.userId,
      tags
    ],
    queryFn: async () => {
      let baseEndpoint = "";

      if (userIdFilter) {
        baseEndpoint = `/post/my/${userIdFilter}`;
      } else if (deletedPost) {
        baseEndpoint = `/post/warning/hr/${user?.userId}`;
      } else if (myPost) {
        baseEndpoint = `/post/my/${user?.userId}`;
      } else if (tags) {
        baseEndpoint = `/post/tags/${user?.userId}`;
      } else if (user?.role === "HR") {
        baseEndpoint = `/post/${user?.userId}`;
      } else {
        baseEndpoint = `/post/filtered/${user?.userId}`;
      }

      const params = new URLSearchParams({
        page: page.toString(),
      });

      if (startDate)
        params.append("startDate", new Date(startDate).toISOString());
      if (endDate) params.append("endDate", new Date(endDate).toISOString());
      if (tags) params.append("tag", tags);

      const res = await api.get(`${baseEndpoint}?${params.toString()}`);
      return res.data;
    },
    staleTime: 0,
    gcTime: 0,
    enabled: !!user?.userId,
  });

  useEffect(() => {
    setPage(0);
    setPostData([]);
    setHasMore(true);
  }, [userIdFilter, startDate, endDate, myPost, deletedPost, tags]);

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
            isArchived={false}
            mypost={myPost}
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
