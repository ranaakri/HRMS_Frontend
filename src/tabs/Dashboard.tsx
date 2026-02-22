import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Briefcase, Settings, ClipboardList } from "lucide-react";
import Logo from "../assets/images/image.png";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { FaHome, FaGamepad } from "react-icons/fa";
import { TbBrandInstagramFilled } from "react-icons/tb";
import { notify } from "@/components/custom/Notification";
import { IoIosNotifications } from "react-icons/io";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { DateOptions } from "./HR/JobManagement/ListJobs";
import { RiOrganizationChart } from "react-icons/ri";
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

interface MenuItem {
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

const EmployeeItems: MenuItem[] = [
  { name: "Archivements", path: "employee/post", icon: TbBrandInstagramFilled },
  { name: "Games", path: "employee/game", icon: FaGamepad },
  { name: "Travel Plans", path: "employee/travel", icon: Briefcase },
  { name: "Job Sharing", path: "employee/job", icon: ClipboardList },
  { name: "Organization", path: "employee/org-chart", icon: RiOrganizationChart },
  // { name: "Settings", path: "employee/org-chart", icon: Settings },
];

const ManagerItems: MenuItem[] = [
  { name: "Archivements", path: "manager/post", icon: TbBrandInstagramFilled },
  { name: "Games", path: "manager/game", icon: FaGamepad },
  { name: "Travel Plans", path: "manager/travel", icon: Briefcase },
  { name: "Job Sharing", path: "manager/job", icon: ClipboardList },
  { name: "Organization", path: "manager/org-chart", icon: RiOrganizationChart },
  // { name: "Settings", path: "resetpassword", icon: Settings },
];

const HRItems: MenuItem[] = [
  { name: "Archivements", path: "hr/post", icon: TbBrandInstagramFilled },
  { name: "Games", path: "hr/game", icon: FaGamepad },
  { name: "Travel Management", path: "hr/travel", icon: Briefcase },
  { name: "Job Management", path: "hr/job", icon: ClipboardList },
  { name: "Organization", path: "hr/org-chart", icon: RiOrganizationChart },
  // { name: "Settings", path: "resetpassword", icon: Settings },
];


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  const MotionLink = motion.create(Link);
  const MotionButton = motion.create(Button);

  useEffect(() => {
    if (!user) {
      notify.error("Logged out", "Please login again");
      return;
    }

    switch (user.role) {
      case "Employee":
        setMenuItems(EmployeeItems);
        break;
      case "HR":
        setMenuItems(HRItems);
        break;
      case "Manager":
        setMenuItems(ManagerItems);
        break;
    }
  }, [user]);


  const getNotification = useQuery({
    queryKey: ["Notification", user?.userId],
    queryFn: () =>
      api
        .get<Notification[]>(`/notification/unread/${user?.userId}`)
        .then((res) => res.data),
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (getNotification.data) {
      setNotifications(getNotification.data);
    }
  }, [getNotification.data]);

  const markRead = useMutation({
    mutationFn: async (receiverId: number) =>
      api.patch(`/notification/${receiverId}`).then((res) => res.data),
    onSuccess: () => notify.success("Marked", "Notification marked as read"),
    onError: (error: any) =>
      notify.error("Error", error?.message || "Something went wrong"),
  });

  const handleMarkRead = async (receiverId: number) => {
    await markRead.mutateAsync(receiverId);
    setNotifications((prev) =>
      prev.filter((val) => val.receiverId !== receiverId),
    );
  };


  const handleNavClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-linear-to-t from-sky-500 to-black shadow-lg transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static`}
      >
        <div className="flex flex-col h-full p-4 text-white">

          <div className="flex flex-col items-center gap-3 p-4 bg-gray-800 rounded-xl shadow-md">
            <img
              src={
                user?.profileUrl?.trim()
                  ? user.profileUrl
                  : "https://betterwaterquality.com/wp-content/uploads/2020/09/dummy-profile-pic-300x300-1-1.png"
              }
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>{user?.name}</div>
            <div className="text-sm font-mono">{user?.email}</div>
          </div>

          <nav className="flex-1 mt-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <MotionLink
                  key={item.name}
                  to={item.path}
                  whileHover={{ x: 5 }}
                  onClick={() => handleNavClick(item.path)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium hover:bg-white hover:text-black transition"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </MotionLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">

        <header className="flex items-center justify-between h-16 px-6 bg-black shadow-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="md:hidden text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>

            <img src={Logo} className="h-8 hidden md:block" />
          </div>

          <div className="flex items-center gap-4">

            <Dialog>
              <DialogTrigger asChild>
                <Button className="relative">
                  <div className="absolute h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                    <IoIosNotifications />
                  </div>
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-2 bg-red-500 text-white">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-h-96 overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>
                    Notifications
                  </DialogTitle>
                  <DialogDescription>
                    Unread notifications
                  </DialogDescription>
                </DialogHeader>

                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.receiverId}
                      className="border p-3 rounded-md my-2 flex justify-between"
                    >
                      <div>
                        <p className="text-xs text-gray-500">
                          {new Date(item.time).toLocaleDateString(
                            undefined,
                            DateOptions,
                          )}
                        </p>
                        <p className="font-semibold">{item.title}</p>
                        <p>{item.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleMarkRead(item.receiverId)}
                      >
                        Mark Read
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    No Notifications
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <MotionButton
              variant="destructive"
              size="sm"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/logout", { replace: true })}
            >
              Logout
            </MotionButton>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <Outlet />
        </main>

      </div>
    </div>
  );
}