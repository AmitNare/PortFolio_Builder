import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useUserAuth from "../UserAuthentication";

export default function UserAuthProtector() {
  const { user } = useUserAuth();

  return user ? (
    <div className="w-full flex flex-col text-foreground">
      <UserHeader toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
      <div className="flex w-full min-h-[calc(100svh-72px)] p-2 text-foreground">
        {/* Main Content Area */}
        <div className="w-full h-full md-max:w-full  flex text-foreground">
          {/* Navbar */}
          <UserNavbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme}>
            <Outlet />
          </UserNavbar>
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/signin" />
  );
}
