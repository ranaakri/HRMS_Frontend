import api from "@/api/api";
import { RouteList } from "@/api/routes";
import { notify } from "@/components/custom/Notification";
import TravelCard from "@/components/custom/TravelCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyTravelPlans() {

    const {user} = useAuth();

    useEffect(() => {
        if(!user){
            notify.error("Error", "User id not defined");
            return;
        }
    }, []);

  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["list"],
    queryFn: () =>
      api
        .get(RouteList.listMyTravelPlans + user?.userId, { withCredentials: true })
        .then((res) => res.data.data),
  });

  if (isLoading) return <div className="">Loading...</div>;

  if (error) return <div className="">Error: {error.message}</div>;

  return (
    <div className="">
      <Button
        variant={"outline"}
        className="m-4 cursor-pointer"
        onClick={() => navigate("/travel/manage/add")}
      >
        Add New Travel Plan
      </Button>
      <Button
        variant={"outline"}
        className="m-4 cursor-pointer"
        onClick={() => navigate("/travel")}
      >
        All
      </Button>
      {data.map((item: any, index: number) => (
        <TravelCard details={item} key={index} />
      ))}
    </div>
  );
}
