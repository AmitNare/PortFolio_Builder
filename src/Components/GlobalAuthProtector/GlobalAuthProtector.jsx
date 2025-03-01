import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

export default function GlobalAuthProtector() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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

  return (
    <div
      className={`${
        isDarkTheme ? "dark" : "light"
      } relative min-h-screen bg-lightBg dark:bg-darkBg flex w-full text-foreground`}
    >
      <div className="w-full flex flex-col items-center bg-background text-foreground">
        <Navbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
        <Outlet />
      </div>
    </div>
  );
}
