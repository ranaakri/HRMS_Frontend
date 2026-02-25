import api from "@/api/api";
import { RouteList } from "@/api/routes";
import TravelCard, {
  type TravelPlanResponse,
} from "@/components/custom/TravelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMemo } from "react";

export default function ListTravelPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: travelPlans = [], isLoading, error } = useQuery<TravelPlanResponse[]>({
    queryKey: ["list"],
    queryFn: () =>
      api
        .get(RouteList.listTravelPlans, { withCredentials: true })
        .then((res) => res.data.data),
  });

  const filteredList = useMemo(() => {
    if (search.trim().length < 2) return travelPlans;
    
    return travelPlans.filter((plan) =>
      plan.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, travelPlans]);

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="container p-4">
      <div className="ml-4 flex gap-4 mb-6">
        {user?.role === "HR" && (
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate(`/${user?.role.toLowerCase()}/travel/manage/add`)}
          >
            Add New Travel Plan
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate(`/${user?.role.toLowerCase()}/travel/manage/my-travel-plans`)}
        >
          My Travel Plans
        </Button>
      </div>

      <div className="ml-4 mb-8 max-w-xl">
        <Input 
          type="text" 
          className="bg-white" 
          placeholder="Search by title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="grid gap-4">
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <TravelCard
              key={item.travelId}
              myTarvelPlan={false}
              details={item}
              expense={false}
            />
          ))
        ) : (
          <div className="text-gray-500">No matching travel plans found.</div>
        )}
      </div>
    </div>
  );
}