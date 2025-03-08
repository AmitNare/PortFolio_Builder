import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "./Components/UserAuthentication";

export default function ProtectedRoutes({ children, role }) {
  const { user, userRole } = useUserAuth();
  const location = useLocation();

  console.log("Protected Routes : ", user, userRole);

  // Allow public routes (for example, URLs starting with "/portfolio/")
  // if (location.pathname.startsWith("/portfolio/")) {
  //   return children;
  // }

  // Redirect unauthenticated users to the home page
  if (!user) {
    return <Navigate to="/" />;
  }

  // If a specific role is required and the user's role doesn't match, redirect
  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
