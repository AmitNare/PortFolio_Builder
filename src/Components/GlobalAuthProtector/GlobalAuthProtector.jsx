import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import Navbar from "../Navbar";

export default function GlobalAuthProtector() {
  const location = useLocation();
  const { userName } = useParams();
  const path = location.pathname;
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

  // Check for User Dashboard Routes
  if (path?.startsWith("/user")) {
    return <Outlet />;
  }

  // Portfolio Page Content
  // if (userName) {
  //   return <Outlet />;
  // }

  console.log("Username: ", userName);

  return (
    <div
      className={`${
        isDarkTheme ? "dark" : "light"
      } relative max-h-svh bg-lightBg dark:bg-darkBg flex w-full text-foreground tracking-wide overflow-auto custom-scrollbar`}
    >
      <div className="w-full flex flex-col items-center bg-background text-foreground overflow-x-hidden overflow-auto custom-scrollbar">
        <Navbar
          toggleTheme={toggleTheme}
          isDarkTheme={isDarkTheme}
          isPortfolioPage={userName}
        />
        <Outlet />
      </div>
    </div>
  );
}
