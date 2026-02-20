import api from "@/api/api";
import UploadTravelingDocs from "@/components/custom/UploadTravelingDoc";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface TravelingUser {
  travelBalance: number;
  travelingUserId: number;
  usedBalance: number;
  user: User;
}

interface User {
  email: string;
  name: string;
  userId: number;
}

export default function TravelingUsersManager() {
  const [travelingUsers, setTravelingUsers] = useState<TravelingUser[]>([]);

  const { travelId } = useParams();
  const {user} = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["TravelingUsersData", user?.userId, travelId],
    queryFn: () =>
      api
        .get<
          TravelingUser[]
        >(`/travel/traveling-user/assign-under/user/${user?.userId}/travel/${travelId}`)
        .then((res) => res.data),
    enabled: !!user?.userId && !!travelId,
  });

  useEffect(() => {
    if (data) setTravelingUsers(data);
  }, [data]);


  if (isLoading)
    return <div className="flex items-center justify-center">Loading....</div>;

  if (isError)
    return (
      <div className="flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );

  return (
    <div className="">
      {travelingUsers.length > 0 ? (
        <div className="">
          {travelingUsers.map((item) => (
            <UploadTravelingDocs item={item} key={item.travelingUserId} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center text-gray-500">No Traveling Users</div>
      )}
    </div>
  );
}
