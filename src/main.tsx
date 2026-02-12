import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./tabs/Auth/LoginPage.tsx";
import { ProtectedRoute } from "./routesProtection/ProtectedRoutes.tsx";
import AuthContextProvier from "./context/AuthContext.tsx";
import UnauthorizedPage from "./tabs/Auth/UnauthorizedPage.tsx";
import Logout from "./tabs/Auth/Logout.tsx";
import AddTravel from "./tabs/HR/AddTravel.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ListTravelPlans from "./tabs/HR/ListTravelPlans.tsx";
import { Toaster } from "sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute requiredRole={["Employee", "HR"]}>
        <App />
        <Toaster />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        index: true,
        element: (
          <ProtectedRoute requiredRole={["Employee", "HR", "Manager"]}>
            <AddTravel />
          </ProtectedRoute>
        ),
      },
      {
        path: "/travel",
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredRole={["Employee", "HR"]}>
                <ListTravelPlans />
              </ProtectedRoute>
            ),
          },
          {
            path: "manage/:travelId",
            element: (
              <ProtectedRoute requiredRole={["Employee", "HR"]}>
                <AddTravel />
              </ProtectedRoute>
            ),
          },
        ],
      },
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
