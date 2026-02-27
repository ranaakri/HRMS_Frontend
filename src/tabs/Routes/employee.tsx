import { ProtectedRoute } from "@/routesProtection/ProtectedRoutes";
import type { RouteObject } from "react-router-dom";
import HomePage from "../General/HomePage";
import UpdateProfile from "@/components/custom/UpdateProfile";
import MyTravelPlans from "../HR/MyTravelPlans";
import UploadTravelingDocsEmp from "../Employee/travel/AddTravelDoc";
import ExpenseList from "../General/ExpenseList";
import AddExpense from "../General/AddExpense";
import OrganizationChart from "../General/OrganizationChart";
import ListAllGames from "../Game/ListAllGames";
import ListGameSlots from "../Game/ListGameSlots";
import BookSlot from "../Game/BookSlot";
import Home from "../Post/Home";
import ListAllPost from "../Post/ListAllPost";
import CreatePost from "../Post/AddPost";
import EditPost from "../Post/EditPost";
import SearchByUsers from "../Post/SearchByUsers";
import ListJobsEmployee from "../Employee/JobReferral/ListJobs";
import MyShares from "../Employee/JobReferral/MyShares";
import MyReferrals from "../Employee/JobReferral/MyReferrals";
import UpdateJob from "../HR/JobManagement/UpdateJob";
import CalenderEvents from "../../components/custom/EventCalender.tsx";

export const employeeRoutes: RouteObject = {
  path: "employee",
  children: [
    {
      path: "home",
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["HR", "Employee", "Manager"]}>
              <HomePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "calendar-events",
          element: (
            <ProtectedRoute requiredRole={["Employee"]}>
              <CalenderEvents />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "profile",
      element: (
        <ProtectedRoute requiredRole={["Employee"]}>
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
      element: (
        <ProtectedRoute requiredRole={["Employee"]}>
          <Home />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole={["Employee"]}>
              <ListAllPost myPost={false} />
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
        {
          path: "mypost",
          element: (
            <ProtectedRoute requiredRole={["Employee"]}>
              <ListAllPost myPost={true} />
            </ProtectedRoute>
          ),
        },
        {
          path: "update/:postId",
          element: (
            <ProtectedRoute requiredRole={["Employee"]}>
              <EditPost />
            </ProtectedRoute>
          ),
        },
        {
          path: "search",
          element: (
            <ProtectedRoute requiredRole={["Employee"]}>
              <SearchByUsers />
            </ProtectedRoute>
          ),
          children: [
            {
              path: ":userId",
              element: (
                <ProtectedRoute requiredRole={["Employee"]}>
                  <ListAllPost myPost={false} />
                </ProtectedRoute>
              ),
            },
          ],
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
            <ProtectedRoute requiredRole={["Employee"]}>
              <UpdateJob isViewOnly={true} />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
};
