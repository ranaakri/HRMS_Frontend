import api from "@/api/api";
import HirarchyCard from "@/components/custom/HirarchyCard";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AssignedEmployees from "./AssignedEmployees";

export interface IOrganizationChart {
  assignedUnder: number;
  designation: string;
  email: string;
  name: string;
  profileUrl: any;
  userId: number;
}

export default function OrganizationChart() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.userId && !selectedUserId) {
        setSelectedUserId(user.userId);
    }
  }, [user, selectedUserId]);

  const { data: list = [], isLoading, isError, error } = useQuery<IOrganizationChart[]>({
    queryKey: ["fetchOrg", selectedUserId],
    queryFn: async () => {
      const res = await api.get(`/users/org/${selectedUserId}`);
      return res.data;
    },
    enabled: !!selectedUserId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <Card className="bg-white border-0 shadow-md p-5 flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <h2 className="text-2xl font-bold text-gray-500">Organization Chart</h2>
        {selectedUserId !== user?.userId && (
          <button 
            onClick={() => setSelectedUserId(user?.userId || null)}
            className="text-sm text-blue-500 underline"
          >
            Back to My View
          </button>
        )}
      </div>

      <div className="flex flex-col items-center">
        {list.map((item) => (
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setSelectedUserId(item.userId)} 
            key={item.userId}
          >
            <HirarchyCard color="blue" item={item} />
            <div className="text-center text-blue-500">|</div>
          </div>
        ))}
        
        {selectedUserId && (
          <div className="">
            <AssignedEmployees userId={selectedUserId} open={true} setSelectedUserId={setSelectedUserId} />
          </div>
        )}
      </div>
    </Card>
  );
}

