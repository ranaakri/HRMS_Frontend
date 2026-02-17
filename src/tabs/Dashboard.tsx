import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Briefcase, Settings, ClipboardList } from "lucide-react";
import Logo from "../assets/images/image.png";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FaHome } from "react-icons/fa";
import { TbBrandInstagramFilled } from "react-icons/tb";
import { notify } from "@/components/custom/Notification";
import { FaGamepad } from "react-icons/fa";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoIosNotifications } from "react-icons/io";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { DateOptions } from "./HR/JobManagement/ListJobs";

// import { useAuth } from "./../../route_protection/AuthContext";
// import { notify } from "./../../components/custom/Notifications";
// import { Isemployee } from "./../../api/Employee_Records_api";

/**
 * Interface for menu items displayed in the sidebar.
 */
interface menu {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface Notification {
  receiverId: number;
  title: string;
  description: string;
  read: boolean;
  time: string;
}

/* ================= MENU CONFIGS ================= */

const EmployeeItems: menu[] = [
  { name: "Home", path: "", icon: FaHome },
  { name: "Travel Plans", path: "employee/travel", icon: Briefcase },
  { name: "Job Sharing", path: "employee/job", icon: ClipboardList },
  { name: "Archivements", path: "userprofile", icon: TbBrandInstagramFilled },
  { name: "Games", path: "userprofile", icon: FaGamepad },
  { name: "Settings", path: "resetpassword", icon: Settings },
];

const HRItems: menu[] = [
  { name: "Home", path: "", icon: FaHome },
  { name: "Travel Management", path: "hr/travel", icon: Briefcase },
  { name: "Job Management", path: "hr/job", icon: ClipboardList },
  {
    name: "Archivements",
    path: "hr/userprofile",
    icon: TbBrandInstagramFilled,
  },
  { name: "Games", path: "userprofile", icon: FaGamepad },
  { name: "Settings", path: "resetpassword", icon: Settings },
];

// const QuickActionIcon = ({ icon, label }: { icon: any; label: string }) => (
//   <div className="flex flex-col items-center gap-1 group cursor-pointer">
//     <div className="p-2 group-hover:bg-blue-500 rounded-xl transition-colors text-xl">
//       {icon}
//     </div>
//     <span className="text-[10px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
//       {label}
//     </span>
//   </div>
// );

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadMenu, setLoadMenu] = useState<menu[]>([]);
  const [notification, setNotifications] = useState<Notification[]>([]);
  const [notificationLength, setNotificationLength] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();

  const MotionLink = motion.create(Link);
  const Motionbutton = motion.create(Button);

  const getNotification = useQuery({
    queryKey: ["Notification", user?.userId],
    queryFn: () =>
      api
        .get<Notification[]>(`/notification/unread/${user?.userId}`)
        .then((res) => res.data),
  });

  useEffect(() => {
    if (getNotification.data) {
      setNotifications(getNotification.data);
      setNotificationLength(getNotification.data.length);
    }
  }, [getNotification.data]);

  useEffect(() => {
    if (!user) {
      notify.error("User is undefined");
    }
    switch (user?.role) {
      case "Employee":
        setLoadMenu(EmployeeItems);
        break;
      case "HR":
        setLoadMenu(HRItems);
        break;
    }
  }, [user?.role]);

  const markRead = useMutation({
    mutationFn: async (receverId: number) => {
      return await api
        .patch(`/notification/${receverId}`)
        .then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Marked", "Notification marked as read");
      return;
    },
    onError: (error: any) => {
      notify.error("Error", error.message);
      console.error(error.cause);
      return;
    },
  });

  const handleMarkRead = async (receverId: number) => {
    await markRead.mutateAsync(receverId);
    setNotifications(notification.filter((val) => val.receiverId != receverId));
    setNotificationLength(notificationLength-1)
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-linear-to-t from-sky-500 to-black shadow-lg transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
        md:translate-x-0 md:static md:block`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div
              className={`flex items-center flex-col gap-3 px-4 py-3 rounded-xl font-medium transition-all text-white bg-gray-700 justify-center shadow-gray-700 shadow-md`}
            >
              <img
                src={"../../../public/image.png"}
                alt="no image"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="">{user?.name}</div>
              <div className="font-mono text-sm">{user?.email}</div>
            </div>
            {loadMenu.map((item) => {
              const Icon = item.icon;

              return (
                <MotionLink
                  key={item.name}
                  to={item.path}
                  whileHover={{ x: 5 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:bg-white/80 hover:text-black duration-150 text-white backdrop-blur-md shadow-inner`}
                >
                  <Icon className="w-5 h-5 opacity-90" />
                  <span className="text-sm tracking-wide">{item.name}</span>
                </MotionLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-8 bg-black backdrop-blur-md border-b shadow-gray-500 shadow-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="md:hidden text-gray-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-800 hidden md:block">
              <img src={Logo} className="h-10 w-auto object-cover" />
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={getNotification.isPending ? true : false}
                  className="relative"
                >
                  <div className="absolute h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                    <IoIosNotifications />
                  </div>
                  {notificationLength > 0 && (
                    <Badge className="absolute -top-1 -right-2 bg-red-300 border-red-600 text-white">
                      {notificationLength}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm md:max-w-lg bg-white">
                <DialogHeader className="border-b p-2">
                  <DialogTitle className="flex items-center gap-4">
                    Notifications{" "}
                    <Badge className="bg-red-300 border-red-600 text-white">
                      {notificationLength}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>Unread Notifications</DialogDescription>
                </DialogHeader>
                <div className="">
                  {notification.length > 0 ? (
                    notification.map((item) => (
                      <div
                        className="grid grid-cols-3 border border-gray-500 p-2 rounded-md"
                        key={item.receiverId}
                      >
                        <div className="col-span-2">
                          <p className="text-xs md:justify-self-end text-gray-500">
                            {new Date(item.time).toLocaleDateString(
                              undefined,
                              DateOptions,
                            )}
                          </p>
                          <p className="font-bold">{item.title}</p>
                          <p className="">{item.description}</p>
                        </div>
                        <div className="justify-self-end flex items-center">
                          <Button
                            onClick={() => handleMarkRead(item.receiverId)}
                          >
                            Mark Read
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center text-gray-500">
                      No Notification
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Motionbutton
              variant="destructive"
              size="sm"
              className="rounded-full px-5 text-xs font-semibold hover:bg-gray-200 hover:text-black hover:opacity-50"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/logout", { replace: true })}
            >
              Logout
            </Motionbutton>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto md:p-6 p-3 bg-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
