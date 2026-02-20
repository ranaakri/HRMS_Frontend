import { DateOptions } from "@/tabs/HR/JobManagement/ListJobs";
import { FaComment, FaHeart } from "react-icons/fa";

export interface PostResponse {
  author: Author;
  commentCount: number;
  createdAt: string;
  deleted: boolean;
  description: string;
  imagePath: string;
  likeCount: number;
  postId: number;
  postType: string;
  tags: string;
  title: string;
  visibleToEmp: boolean;
  visibleToManager: boolean;
}

export interface Author {
  email: string;
  name: string;
  userId: number;
  profileUrl: string;
  designation: string;
}

export default function PostBox({ post }: { post: PostResponse }) {
  const profile = post.author.profileUrl;
  return (
    <div className="w-full flex justify-center">
      <div className="gap-4 p-5 md:max-w-200 md:min-w-120 m-5 rounded-2xl bg-gray-100 shadow-md w-full">
        <div className="flex items-center">
          <img
            src={
              profile === null ||
              (profile && profile.trim().length === 0) ||
              profile === undefined
                ? "https://betterwaterquality.com/wp-content/uploads/2020/09/dummy-profile-pic-300x300-1-1.png"
                : post.author.profileUrl
            }
            alt="no image"
            width={"80px"}
            className="rounded-full p-2"
          />
          <div className="">
            <p className="font-bold text-lg">{post.author.name}</p>
            <div className="flex text-sm font-mono">
              <p>
                {post.author.designation}{" "}
                <span className="text-gray-400">
                  {" "}
                  {new Date(post.createdAt).toLocaleDateString(
                    undefined,
                    DateOptions,
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="text-xl font-bold">{post.title}</div>
        {post.postType === "I" && (
          <div className="my-4">
            <img src={post.imagePath} />
          </div>
        )}
        <div className="">{post.description}</div>
        <hr className="my-4 text-gray-300" />
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <FaHeart /> {post.likeCount}
          </div>
          <div className="flex items-center gap-2">
            <FaComment /> {post.commentCount}
          </div>
        </div>
      </div>
    </div>
  );
}
