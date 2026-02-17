import api from "@/api/api";
import { RouteList } from "@/api/routes";
import TravelCard from "@/components/custom/TravelCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function ListTravelPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["list"],
    queryFn: () =>
      api
        .get(RouteList.listTravelPlans, { withCredentials: true })
        .then((res) => res.data.data),
  });

  if (isLoading) return <div className="">Loading...</div>;

  if (error) return <div className="">Error: {error.message}</div>;

  return (
    <div className="">
      {user?.role === "HR" && (
        <Button
          variant={"outline"}
          className="m-4 cursor-pointer"
          onClick={() => navigate("/hr/travel/manage/add")}
        >
          Add New Travel Plan
        </Button>
      )}
      <Button
        variant={"outline"}
        className="m-4 cursor-pointer"
        onClick={() => navigate("/hr/travel/manage/my-travel-plans")}
      >
        My Travel Plans
      </Button>
      {data.map((item: any, index: number) => (
        <TravelCard details={item} key={index} expense={false} />
      ))}
    </div>
  );
}
