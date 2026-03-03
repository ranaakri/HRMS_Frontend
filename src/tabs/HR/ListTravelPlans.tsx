import api from "@/api/api";
import { RouteList } from "@/api/routes";
import TravelCard, {
  type TravelPlanResponse,
} from "@/components/custom/TravelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function ListTravelPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const {
    data: travelPlans = [],
    isLoading,
    error,
  } = useQuery<TravelPlanResponse[]>({
    queryKey: ["list", page],
    queryFn: () =>
      api
        .get(RouteList.listTravelPlans + "?page=" + page, {
          withCredentials: true,
        })
        .then((res) => res.data.data),
  });

  const filteredList = useMemo(() => {
    if (search.trim().length < 2) return travelPlans;

    return travelPlans.filter((plan) =>
      plan.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, travelPlans]);

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="">
      <div className="flex justify-between">
        <div className="ml-4 flex gap-4 mb-6">
          {user?.role === "HR" && (
            <Button
              variant="outline"
              className="cursor-pointe bg-gray-500 text-white"
              onClick={() =>
                navigate(`/${user?.role.toLowerCase()}/travel/manage/add`)
              }
            >
              Add New Travel Plan
            </Button>
          )}
          <Button
            variant="outline"
            className="cursor-pointer bg-gray-500 text-white"
            onClick={() =>
              navigate(
                `/${user?.role.toLowerCase()}/travel/manage/my-travel-plans`,
              )
            }
          >
            My Travel Plans
          </Button>
        </div>

        <div className="ml-4 mb-4 flex items-center gap-4">
          <Button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Prev
          </Button>
          <span className="text-sm font-medium">Page {page + 1}</span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={travelPlans.length < 10}
          >
            Next
          </Button>
        </div>
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
