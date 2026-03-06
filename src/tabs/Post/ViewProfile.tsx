import { useParams } from "react-router-dom";
import ListAllPost from "./ListAllPost";

export default function ViewProfile() {
  const { userId } = useParams();

  return (
    <ListAllPost
      myPost={false}
      userIdFilter={userId ? Number.parseInt(userId) : null}
    />
  );
}
