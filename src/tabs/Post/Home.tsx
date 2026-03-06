import { FaHome, FaRegPlusSquare } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import { IoPersonSharp, IoSearch } from "react-icons/io5";

export default function Home() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();

  const navItems = [
    { to: ".", icon: <FaHome className="size-5" />, key: "post" },
    { to: "add", icon: <FaRegPlusSquare className="size-5" />, key: "add" },
    { to: "search", icon: <IoSearch className="size-5" />, key: "search" },
    {
      to: "profile",
      icon: (
        <span className="text-xl font-bold leading-none">
          <IoPersonSharp />
        </span>
      ),
      key: "profile",
    },
  ];

  const isActive = (to: string, key: string) => {
    if (to === "." && (currentPath === "post" || currentPath === ""))
      return true;
    return currentPath === key;
  };

  return (
    <div className="min-h-screen relative pb-28">
      <div className="mx-auto pt-6">
        <Outlet />
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <nav className="bg-black/90 backdrop-blur-md text-white shadow-2xl rounded-full px-8 py-3 flex items-center gap-8 border border-white/10">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`relative p-2 transition-all duration-300 ease-in-out hover:scale-110 ${
                isActive(item.to, item.key)
                  ? "text-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.icon}
              {isActive(item.to, item.key) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
