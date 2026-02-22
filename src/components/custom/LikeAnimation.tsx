import { FaHeart } from "react-icons/fa";

export function LikeAnimationLayer({
  likes,
}: {
  likes: { id: number; x: number; y: number }[];
}) {
  return (
    <>
      {likes.map((like) => (
        <FaHeart
          key={like.id}
          className="absolute text-red-500 animate-bounce transition-all duration-700 opacity-80 scale-110"
          style={{
            left: like.x - 30,
            top: like.y - 30,
            fontSize: "60px",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}