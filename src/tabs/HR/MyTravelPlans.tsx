import api from "@/api/api";
import TravelCard, { type TravelPlanResponse } from "@/components/custom/TravelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyTravelPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const { data: travelPlans = [] , isLoading, error } = useQuery<TravelPlanResponse[]>({
    queryKey: ["list", user?.userId],
    enabled: !!user?.userId,
    queryFn: () => api
      .get(`/travel/traveling-user/user/${user?.userId}`, { withCredentials: true })
      .then((res) => res.data.data),
  });

  const filteredList = useMemo(() => {
      if (search.trim().length < 2) return travelPlans;
      
      return travelPlans.filter((plan) =>
        plan.title.toLowerCase().includes(search.toLowerCase())
      );
    }, [search, travelPlans]);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto">
      {user?.role === "HR" && (
        <div className="ml-4 mb-6 flex gap-4">
          <Button variant="outline" className="bg-gray-500 text-white" onClick={() => navigate("/hr/travel/manage/add")}>
            Add New Travel Plan
          </Button>
          <Button variant="outline" className="bg-gray-500 text-white" onClick={() => navigate("/hr/travel")}>
            View All Plans
          </Button>
        </div>
      )}

      {user?.role === "Manager" && (
        <div className="ml-4 mb-6 flex gap-4">
          <Button variant="outline" onClick={() => navigate("../../../travel")}>
            View All Plans
          </Button>
        </div>
      )}

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
        {filteredList?.length > 0 ? (
          filteredList.map((item: any) => (
            <TravelCard 
              key={item.id + "_list"}
              myTarvelPlan={true} 
              details={item} 
              expense={true} 
            />
          ))
        ) : (
          <div className="py-10 text-center text-gray-500">
            No travel plans found.
          </div>
        )}
      </div>
    </div>
  );
}