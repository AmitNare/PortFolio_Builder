import { Navigate, Outlet } from "react-router-dom";
import useUserAuth from "../UserAuthentication";
import UserHeader from "../UserHeader";
import UserNavbar from "../UserNavbar";
import { useState, useEffect } from "react";

export default function UserAuthProtector() {
  const { user } = useUserAuth();
  const [isDarkTheme, setIsDarkTheme] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Toggle theme logic
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    document.documentElement.classList.toggle("dark", newTheme);
    setIsDarkTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setIsDarkTheme(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Save theme changes to localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  return user ? (
    <div className="w-full max-h-svh flex flex-col bg-lightBg dark:bg-darkBg text-foreground overflow-x-hidden overflow-auto custom-scrollbar ">
      <UserHeader toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
      <div className="flex w-full min-h-[calc(100svh-72px)] p-2 md-max:p-0 text-foreground bg-lightBg dark:bg-darkBg overflow-x-hidden overflow-auto custom-scrollbar">
        {/* Main Content Area */}
        <div className="w-full h-full flex text-foreground z-50 overflow-x-hidden overflow-auto custom-scrollbar">
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
