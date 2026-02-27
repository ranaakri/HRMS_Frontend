import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LoginPage from "./tabs/Auth/LoginPage.tsx";
import { ProtectedRoute } from "./routesProtection/ProtectedRoutes.tsx";
import AuthContextProvier, { useAuth } from "./context/AuthContext.tsx";
import UnauthorizedPage from "./tabs/Auth/UnauthorizedPage.tsx";
import Logout from "./tabs/Auth/Logout.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { employeeRoutes } from "./tabs/Routes/employee.tsx";
import { hrRoutes } from "./tabs/Routes/hr.tsx";
import { managerRoutes } from "./tabs/Routes/manager.tsx";

function DefaultLanding() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "Employee":
      return <Navigate to="/employee/home" replace />;
    case "HR":
      return <Navigate to="/hr/home" replace />;
    case "Manager":
      return <Navigate to="/manager/home" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute requiredRole={["Employee", "HR", "Manager"]}>
        <App />
        <Toaster />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DefaultLanding />,
      },
      employeeRoutes,
      hrRoutes,
      managerRoutes,
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/logout",
    element: (
      <ProtectedRoute requiredRole={["Employee", "HR", "Manager"]}>
        <Logout />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unauthorized",
    element: (
      <ProtectedRoute requiredRole={["Admin", "HR", "Employee", "Manager"]}>
        <UnauthorizedPage />
      </ProtectedRoute>
    ),
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthContextProvier>
      <RouterProvider router={router} />
    </AuthContextProvier>
  </QueryClientProvider>,
);
