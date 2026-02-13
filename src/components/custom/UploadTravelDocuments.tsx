import api from "@/api/api";
import { RouteList } from "@/api/routes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UploadTravelingDocs from "./UploadTravelingDoc";

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

export default function UploadTravelDocuments() {
  const [travelingUsers, setTravelingUsers] = useState<TravelingUser[]>([]);

  const { travelId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["TravelingUsers"],
    queryFn: () =>
      api
        .get<
          TravelingUser[]
        >(RouteList.travelingUsers + `/${travelId}`, { withCredentials: true })
        .then((res) => res.data),
  });

  useEffect(() => {
    if (data) setTravelingUsers(data);
  }, [data]);

  // const handleFileUplaod = () => {
  //   try{
  //     const response = await api.post(`travel/gallery/${travelId}`, formData, {withCredentials: true}).then(res => res.data);
  //     setUploaded([...uploaded, response])
  //     notify.success("Image uploaded successfully")
  //   }catch(error: any){
  //     notify.error("Error", error.message);
  //     console.log("Error in uploading image", error)
  //   }
  //   finally{
  //     setLoading(false);
  //   }
  // }

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
        <div className=""></div>
      )}
    </div>
  );
}
