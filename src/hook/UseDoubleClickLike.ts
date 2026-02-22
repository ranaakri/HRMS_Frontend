import { useState, useCallback } from "react";

interface Like {
  id: number;
  x: number;
  y: number;
}

export function useDoubleClickLike() {
  const [likes, setLikes] = useState<Like[]>([]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const id = Date.now();

      setLikes((prev) => [...prev, { id, x, y }]);

      setTimeout(() => {
        setLikes((prev) => prev.filter((like) => like.id !== id));
      }, 700);
    },
    []
  );

  return { likes, handleDoubleClick };
}