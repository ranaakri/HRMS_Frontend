import { FaCameraRetro, FaHome, FaRegPlusSquare } from "react-icons/fa";
import { Link, Outlet } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen relative pb-24">
      <Outlet />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 bg-black text-white shadow-xl rounded-full px-10 py-3 flex gap-10 border z-50">
        <Link to={'.'} className="cursor-pointer hover:text-blue-500 transition">
            <FaHome className="size-5" />
        </Link>

        <Link to={'add'} className="cursor-pointer hover:text-blue-500 transition">
            <FaRegPlusSquare className="size-5" />
        </Link>

        <Link to={"mypost"} className="cursor-pointer hover:text-blue-500 transition">
          <FaCameraRetro className="size-5" />
        </Link>
      </div>
    </div>
  );
}