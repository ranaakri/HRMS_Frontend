import api from "@/api/api";
import type { PostResponse } from "@/components/custom/TextMessageBox";
import PostBox from "@/components/custom/TextMessageBox";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function ListAllPost() {
  const [page, setPage] = useState(0);
  const [postData, setPostData] = useState<PostResponse[]>([]);

  const loadPost = useQuery({
    queryKey: ["loadpost", page],
    queryFn: () => api.get(`/post?page=${page}`).then((res) => res.data),
  });

  useEffect(() => {
    if (loadPost.data) {
      setPostData([...postData, ...loadPost.data]);
    }
  }, [loadPost.data]);

  return (
    <div className="">
      {postData.length > 0 && postData.map((item) => <PostBox post={item} />)}
      <div className="flex justify-center">
        <Button className="bg-gray-300 text-white shadow-md" onClick={() => setPage(page + 1)}>
          Load more
        </Button>
      </div>
      {loadPost.isLoading && (
        <div className="flex items-center justify-center">Loading...</div>
      )}
    </div>
  );
}
