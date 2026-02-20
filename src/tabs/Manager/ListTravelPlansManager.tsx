import api from "@/api/api";
import { RouteList } from "@/api/routes";
import { notify } from "@/components/custom/Notification";
import TravelCard from "@/components/custom/TravelCard";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ListTravelPlansManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["listTravelPlansManager"],
    queryFn: () =>
      api
        .get(RouteList.listTravelPlans)
        .then((res) => res.data.data),
  });

  if (isLoading) return <div className="">Loading...</div>;

  if (error) return <div className="">Error: {error.message}</div>;

  return (
    <div className="">
      {data.length > 0 ? (
        data.map((item: any, index: number) => (
          <TravelCard details={item} key={index} expense={true} />
        ))
      ) : (
        <div className="flex items-center justify-center text-gray-900">
          No Travel plans
        </div>
      )}
    </div>
  );
}