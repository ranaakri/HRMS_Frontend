import { FaComment, FaHeart } from "react-icons/fa";

interface Props {
  readonly profileUrl: string;
  readonly name: string;
  readonly designation: string;
  readonly role: string;
  readonly postTime: string;
  readonly likeCount: number;
  readonly commentCount: number;
  readonly message: string;
}
export default function TextMessageBox({
  profileUrl,
  name,
  designation,
  role,
  postTime,
  likeCount,
  commentCount,
  message,
}: Props) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="gap-4 p-5 md:max-w-200 md:min-w-120 m-5 rounded-2xl bg-gray-100 shadow-md">
        <div className="flex items-center">
          <img
            src={profileUrl}
            alt="no image"
            width={"80px"}
            className="rounded-full p-2"
          />
          <div className="">
            <p className="font-bold text-lg">{name}</p>
            <div className="flex text-sm font-mono">
              <p>
                {designation} {"<" + role + ">"}{" "}
                <span className="text-gray-400"> {postTime}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="">{message}</div>
        <hr className="my-4 text-gray-300" />
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <FaHeart /> {likeCount}
          </div>
          <div className="flex items-center gap-2">
            <FaComment /> {commentCount}
          </div>
        </div>
      </div>
    </div>
  );
}
