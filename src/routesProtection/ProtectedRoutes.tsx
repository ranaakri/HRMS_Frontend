import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface IProtectedRoute {
  children: React.ReactNode;
  requiredRole: string[];
}

export const ProtectedRoute: React.FC<IProtectedRoute> = ({
  children,
  requiredRole,
}) => {
  const { isLoggedin, user } = useAuth();

  if (!isLoggedin && user?.role === undefined) {
    return <Navigate to="/login" replace />
  }

  if (user?.role && !requiredRole.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <>{children}</>;
};
