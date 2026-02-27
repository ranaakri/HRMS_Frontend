import { ProtectedRoute } from "@/routesProtection/ProtectedRoutes";
import type { RouteObject } from "react-router-dom";
import ListAllUsers from "../HR/ManageUsers/ListAllUsers";
import UpdateUser from "../HR/ManageUsers/UpdateUser";
import AddUser from "../HR/ManageUsers/AddUser";
import HomePage from "../General/HomePage";
import UpdateProfile from "@/components/custom/UpdateProfile";
import ListJobs from "../HR/JobManagement/ListJobs";
import CreateJob from "../HR/JobManagement/CreateJob";
import UpdateJob from "../HR/JobManagement/UpdateJob";
import JobShares from "../HR/JobManagement/JobShares";
import ListJobsEmployee from "../Employee/JobReferral/ListJobs";
import MyShares from "../Employee/JobReferral/MyShares";
import MyReferrals from "../Employee/JobReferral/MyReferrals";
import JobReferral from "../HR/JobManagement/JobReferrals";
import ListTravelPlans from "../HR/ListTravelPlans";
import AddTravel from "../HR/AddTravel";
import UpdateTravelDetails from "../HR/UpdateTravel";
import AddUserToTravel from "@/components/custom/AddUserToTravel";
import MyTravelPlans from "../HR/MyTravelPlans";
import ExpenseList from "../General/ExpenseList";
import AddExpense from "../General/AddExpense";
import UploadTravelDocuments from "@/components/custom/UploadTravelDocuments";
import OrganizationChart from "../General/OrganizationChart";
import ListAllGames from "../Game/ListAllGames";
import AddGame from "../Game/AddGame";
import UpdateGame from "../Game/UpdateGame";
import ListGameSlots from "../Game/ListGameSlots";
import BookSlot from "../Game/BookSlot";
import Home from "../Post/Home";
import ListAllPost from "../Post/ListAllPost";
import CreatePost from "../Post/AddPost";
import EditPost from "../Post/EditPost";
import SearchByUsers from "../Post/SearchByUsers";
import CalenderEvents from "../../components/custom/EventCalender.tsx";
import ListAllDepartments from "../HR/ManageDepartment/ListAllDeoartments.tsx";

export const hrRoutes: RouteObject = {
  path: "hr",
  children: [
    {
      path: "department",
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <ListAllDepartments />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "users",
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <ListAllUsers />
            </ProtectedRoute>
          ),
        },
        {
          path: "update/:userId",
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <UpdateUser />
            </ProtectedRoute>
          ),
        },
        {
          path: "add",
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <AddUser />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "home",
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <HomePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "calendar-events",
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <CalenderEvents />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "profile",
      element: (
        <ProtectedRoute requiredRole={["HR"]}>
          <UpdateProfile />
        </ProtectedRoute>
      ),
    },
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
            },
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
                    <ProtectedRoute requiredRole={["HR"]}>
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
                <ProtectedRoute requiredRole={["HR", "Employee", "Manager"]}>
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
    {
      path: "post",
      element: (
        <ProtectedRoute requiredRole={["HR"]}>
          <Home />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <ListAllPost myPost={false} />
            </ProtectedRoute>
          ),
        },
        {
          path: "add",
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <CreatePost />
            </ProtectedRoute>
          ),
        },
        {
          path: "mypost",
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <ListAllPost myPost={true} />
            </ProtectedRoute>
          ),
        },
        {
          path: "update/:postId",
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <EditPost />
            </ProtectedRoute>
          ),
        },
        {
          path: "search",
          element: (
            <ProtectedRoute requiredRole={["HR"]}>
              <SearchByUsers />
            </ProtectedRoute>
          ),
          children: [
            {
              path: ":userId",
              element: (
                <ProtectedRoute requiredRole={["HR"]}>
                  <ListAllPost myPost={false} />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ],
    },
  ],
};
