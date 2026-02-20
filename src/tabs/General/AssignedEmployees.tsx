import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { IOrganizationChart } from "./OrganizationChart";
import HirarchyCard from "@/components/custom/HirarchyCard";

export default function AssignedEmployees({
  userId,
  open,
  setSelectedUserId,
}: {
  userId: number;
  open: boolean;
  setSelectedUserId: Dispatch<SetStateAction<number | null>>;
}) {
  const [list, setList] = useState<IOrganizationChart[]>([]);

  const { isLoading, isError, error } = useQuery({
    queryKey: ["GetAssignedUnder", userId],
    queryFn: async () => {
      const data = await api
        .get(`/users/org/under/${userId}`)
        .then((res) => res.data);
      setList(data);
      return data;
    },
  });

  if (isLoading)
    return <div className="flex justify-center items-center">Loading...</div>;

  if (isError)
    return <div className="text-red-500">Error: {error.message}</div>;
  return (
    open && (
      <Card className="bg-white p-5">
        <div className="grid gird-cols-1 md:grid-cols-2">
          {list.length > 0 ? (
            list.map((item) => (
              <div className="cursor-pointer" onClick={() => setSelectedUserId(item.userId)}>
                <HirarchyCard
                  color="yellow"
                  item={item}
                  key={item.userId + "_assigned"}
                />
              </div>
            ))
          ) : (
            <div className="col-span-2 text-gray-500">
              No one is assigned under you
            </div>
          )}
        </div>
      </Card>
    )
  );
}
