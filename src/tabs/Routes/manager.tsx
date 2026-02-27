import { ProtectedRoute } from "@/routesProtection/ProtectedRoutes";
import type { RouteObject } from "react-router-dom";
import HomePage from "../General/HomePage";
import UpdateProfile from "@/components/custom/UpdateProfile";
import ListTravelPlansManager from "../Manager/ListTravelPlansManager";
import TravelingUsersManager from "../Manager/TravelingUsersManager";
import UploadTravelingDocsEmp from "../Employee/travel/AddTravelDoc";
import MyTravelPlans from "../HR/MyTravelPlans";
import ExpenseList from "../General/ExpenseList";
import AddExpense from "../General/AddExpense";
import ListAllGames from "../Game/ListAllGames";
import ListGameSlots from "../Game/ListGameSlots";
import ListJobsEmployee from "../Employee/JobReferral/ListJobs";
import MyReferrals from "../Employee/JobReferral/MyReferrals";
import MyShares from "../Employee/JobReferral/MyShares";
import BookSlot from "../Game/BookSlot";
import OrganizationChart from "../General/OrganizationChart";
import UpdateJob from "../HR/JobManagement/UpdateJob";
import CreatePost from "../Post/AddPost";
import EditPost from "../Post/EditPost";
import ListAllPost from "../Post/ListAllPost";
import SearchByUsers from "../Post/SearchByUsers";
import CalenderEvents from "../../components/custom/EventCalender.tsx";
import Home from "../Post/Home.tsx";

export const managerRoutes: RouteObject = {
  path: "manager",
  children: [
    {
      path: "home",
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <HomePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "calendar-events",
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <CalenderEvents />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "profile",
      element: (
        <ProtectedRoute requiredRole={["Manager"]}>
          <UpdateProfile />
        </ProtectedRoute>
      ),
    },
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
            {
              path: "upload-documents/:travelId",
              element: (
                <ProtectedRoute requiredRole={["Manager"]}>
                  <UploadTravelingDocsEmp />
                </ProtectedRoute>
              ),
            },
            {
              path: "my-travel-plans",

              children: [
                {
                  index: true,
                  element: (
                    <ProtectedRoute requiredRole={["Manager"]}>
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
                        <ProtectedRoute requiredRole={["Manager"]}>
                          <ExpenseList isForApproval={false} />
                        </ProtectedRoute>
                      ),
                    },
                    {
                      path: "add",
                      element: (
                        <ProtectedRoute requiredRole={["Manager"]}>
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
      ],
    },
    {
      path: "game",
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <ListAllGames activeGames={true} />
            </ProtectedRoute>
          ),
        },
        {
          path: "slots/:gameId",
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute requiredRole={["Manager"]}>
                  <ListGameSlots />
                </ProtectedRoute>
              ),
            },
            {
              path: "book/:slotId",
              element: (
                <ProtectedRoute requiredRole={["Manager"]}>
                  <BookSlot />
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
    {
      path: "post",
      element: (
        <ProtectedRoute requiredRole={["Manager"]}>
          <Home />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <ListAllPost myPost={false} />
            </ProtectedRoute>
          ),
        },
        {
          path: "add",
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <CreatePost />
            </ProtectedRoute>
          ),
        },
        {
          path: "mypost",
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <ListAllPost myPost={true} />
            </ProtectedRoute>
          ),
        },
        {
          path: "update/:postId",
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <EditPost />
            </ProtectedRoute>
          ),
        },
        {
          path: "search",
          element: (
            <ProtectedRoute requiredRole={["Manager"]}>
              <SearchByUsers />
            </ProtectedRoute>
          ),
          children: [
            {
              path: ":userId",
              element: (
                <ProtectedRoute requiredRole={["Manager"]}>
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
