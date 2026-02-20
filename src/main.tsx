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
import UpdateTravelDetails from "./tabs/HR/UpdateTravel.tsx";
import AddUserToTravel from "./components/custom/AddUserToTravel.tsx";
import MyTravelPlans from "./tabs/HR/MyTravelPlans.tsx";
import UploadTravelDocuments from "./components/custom/UploadTravelDocuments.tsx";
import CreateJob from "./tabs/HR/JobManagement/CreateJob.tsx";
import UpdateJob from "./tabs/HR/JobManagement/UpdateJob.tsx";
import ListJobs from "./tabs/HR/JobManagement/ListJobs.tsx";
import ListJobsEmployee from "./tabs/Employee/JobReferral/ListJobs.tsx";
import MyShares from "./tabs/Employee/JobReferral/MyShares.tsx";
import MyReferrals from "./tabs/Employee/JobReferral/MyReferrals.tsx";
import JobShares from "./tabs/HR/JobManagement/JobShares.tsx";
import JobReferral from "./tabs/HR/JobManagement/JobReferrals.tsx";
import ExpenseList from "./tabs/General/ExpenseList.tsx";
import AddExpense from "./tabs/General/AddExpense.tsx";
import UploadTravelingDocsEmp from "./tabs/Employee/travel/AddTravelDoc.tsx";
import ListTravelPlansManager from "./tabs/Manager/ListTravelPlansManager.tsx";
import TravelingUsersManager from "./tabs/Manager/TravelingUsersManager.tsx";
import CreatePost from "./tabs/General/AddPost.tsx";
import ListAllPost from "./tabs/General/ListAllPost.tsx";
import AddGame from "./tabs/Game/AddGame.tsx";
import ListAllGames from "./tabs/Game/ListAllGames.tsx";
import UpdateGame from "./tabs/Game/UpdateGame.tsx";
import ListGameSlots from "./tabs/Game/ListGameSlots.tsx";
import OrganizationChart from "./tabs/General/OrganizationChart.tsx";
import BookSlot from "./tabs/Game/BookSlot.tsx";

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
        path: "/",
        index: true,
        element: (
          <ProtectedRoute requiredRole={["Employee", "HR", "Manager"]}>
            <AddUserToTravel />
          </ProtectedRoute>
        ),
      },
      {
        path: "employee",
        children: [
          {
            path: "travel",
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute requiredRole={["Employee"]}>
                    <MyTravelPlans />
                  </ProtectedRoute>
                ),
              },
              {
                path: "manage",
                children: [
                  {
                    path: "upload-documents/:travelId",
                    element: (
                      <ProtectedRoute requiredRole={["Employee"]}>
                        <UploadTravelingDocsEmp />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "expense/:travelId",

                    children: [
                      {
                        index: true,
                        element: (
                          <ProtectedRoute requiredRole={["Employee"]}>
                            <ExpenseList isForApproval={false} />
                          </ProtectedRoute>
                        ),
                      },
                      {
                        path: "add",
                        element: (
                          <ProtectedRoute requiredRole={["Employee"]}>
                            <AddExpense />
                          </ProtectedRoute>
                        ),
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: "org-chart",
            element: (
              <ProtectedRoute requiredRole={["Employee"]}>
                <OrganizationChart />
              </ProtectedRoute>
            ),
          },
          {
            path: "game",
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute requiredRole={["Employee"]}>
                    <ListAllGames activeGames={false} />
                  </ProtectedRoute>
                ),
              },
              {
                path: "slots/:gameId",
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute requiredRole={["Employee"]}>
                        <ListGameSlots />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "book/:slotId",
                    element: (
                      <ProtectedRoute requiredRole={["Employee"]}>
                        <BookSlot />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: "post",
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute requiredRole={["Employee"]}>
                    <ListAllPost />
                  </ProtectedRoute>
                ),
              },
              {
                path: "add",
                element: (
                  <ProtectedRoute requiredRole={["Employee"]}>
                    <CreatePost />
                  </ProtectedRoute>
                ),
              },
            ],
          },
          {
            path: "job",
            children: [
              {
                index: true,
                element: (
                  //remove hr just for testing
                  <ProtectedRoute requiredRole={["Employee"]}>
                    <ListJobsEmployee />
                  </ProtectedRoute>
                ),
              },
              {
                path: "my-shares",
                element: (
                  <ProtectedRoute requiredRole={["Employee"]}>
                    <MyShares />
                  </ProtectedRoute>
                ),
              },
              {
                path: "my-referrals",
                element: (
                  <ProtectedRoute requiredRole={["Employee"]}>
                    <MyReferrals />
                  </ProtectedRoute>
                ),
              },
              {
                path: "view/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <UpdateJob isViewOnly={true} />
                  </ProtectedRoute>
                ),
              }
            ],
          },
        ],
      },
      {
        path: "manager",
        children: [
          {
            path: "travel",
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute requiredRole={["Manager"]}>
                    <ListTravelPlansManager />
                  </ProtectedRoute>
                ),
              },
              {
                path: "manage",
                children: [
                  {
                    path: "traveling-users/:travelId",
                    element: (
                      <ProtectedRoute requiredRole={["Manager"]}>
                        <TravelingUsersManager />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: "org-chart",
            element: (
              <ProtectedRoute requiredRole={["Manager"]}>
                <OrganizationChart />
              </ProtectedRoute>
            ),
          },
          {
            path: "job",
            children: [
              {
                index: true,
                element: (
                  //remove hr just for testing
                  <ProtectedRoute requiredRole={["Manager"]}>
                    <ListJobsEmployee />
                  </ProtectedRoute>
                ),
              },
              {
                path: "view/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["Manager"]}>
                    <UpdateJob isViewOnly={true} />
                  </ProtectedRoute>
                ),
              },
              {
                path: "view/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["Manager"]}>
                    <UpdateJob isViewOnly={true} />
                  </ProtectedRoute>
                ),
              },
              {
                path: "my-shares",
                element: (
                  <ProtectedRoute requiredRole={["Manager"]}>
                    <MyShares />
                  </ProtectedRoute>
                ),
              },
              {
                path: "my-referrals",
                element: (
                  <ProtectedRoute requiredRole={["Manager"]}>
                    <MyReferrals />
                  </ProtectedRoute>
                ),
              },
            ],
          },
        ],
      },
      {
        path: "hr",
        children: [
          {
            path: "job",
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <ListJobs />
                  </ProtectedRoute>
                ),
              },
              {
                path: "add",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <CreateJob />
                  </ProtectedRoute>
                ),
              },
              {
                path: "update/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <UpdateJob isViewOnly={false} />
                  </ProtectedRoute>
                ),
              },
              {
                path: "view/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <UpdateJob isViewOnly={true} />
                  </ProtectedRoute>
                ),
              },
              {
                path: "shares/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <JobShares />
                  </ProtectedRoute>
                ),
              },
              {
                path: "share",

                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <ListJobsEmployee />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "my-shares",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <MyShares />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "my-referrals",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <MyReferrals />
                      </ProtectedRoute>
                    ),
                  },
                  {
                path: "view/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <UpdateJob isViewOnly={true} />
                  </ProtectedRoute>
                ),
              }
                ],
              },
              {
                path: "referrals/:jobId",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <JobReferral />
                  </ProtectedRoute>
                ),
              },
            ],
          },
          {
            path: "travel",
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <ListTravelPlans />
                  </ProtectedRoute>
                ),
              },
              {
                path: "manage",
                children: [
                  {
                    path: "view/:travelId",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <AddTravel />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "update/:travelId",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <UpdateTravelDetails />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "add-traveler/:travelId",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <AddUserToTravel />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "add",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <AddTravel />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "my-travel-plans",

                    children: [
                      {
                        index: true,
                        element: (
                          <ProtectedRoute
                            requiredRole={["HR", "Employee", "Manager"]}
                          >
                            <MyTravelPlans />
                          </ProtectedRoute>
                        ),
                      },
                      {
                        path: "expense/:travelId",

                        children: [
                          {
                            index: true,
                            element: (
                              <ProtectedRoute requiredRole={["HR"]}>
                                <ExpenseList isForApproval={false} />
                              </ProtectedRoute>
                            ),
                          },
                          {
                            path: "add",
                            element: (
                              <ProtectedRoute requiredRole={["HR"]}>
                                <AddExpense />
                              </ProtectedRoute>
                            ),
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "expense-approval/:travelId",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <ExpenseList isForApproval={true} />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "upload-documents/:travelId",
                    element: (
                      <ProtectedRoute
                        requiredRole={["HR", "Employee", "Manager"]}
                      >
                        <UploadTravelDocuments />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: "org-chart",
            element: (
              <ProtectedRoute requiredRole={["HR"]}>
                <OrganizationChart />
              </ProtectedRoute>
            ),
          },
          {
            path: "game",
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <ListAllGames activeGames={false} />
                  </ProtectedRoute>
                ),
              },
              {
                path: "add",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <AddGame />
                  </ProtectedRoute>
                ),
              },
              {
                path: "update/:gameId",
                element: (
                  <ProtectedRoute requiredRole={["HR"]}>
                    <UpdateGame />
                  </ProtectedRoute>
                ),
              },
              {
                path: "slots/:gameId",
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <ListGameSlots />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: "book/:slotId",
                    element: (
                      <ProtectedRoute requiredRole={["HR"]}>
                        <BookSlot />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
            ],
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
