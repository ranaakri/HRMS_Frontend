import TravelCard from "@/components/custom/TravelCard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function ListTravelPlans() {

    const server_url = import.meta.env.VITE_SERVER_URL

  const { data, isLoading, error } = useQuery({
    queryKey: ["list"],
    queryFn: () =>
      axios
        .get( server_url + "/travel", { withCredentials: true })
        .then((res) => res.data.data),
  });

  if (isLoading) return <div className="">Loading...</div>;

  if (error) return <div className="">Error: {error.message}</div>;

  return (
    <div className="">
      {data.map((item: any) => (
        <TravelCard details={item} key={item.title} />
    
      ))}
    </div>
  );
}
