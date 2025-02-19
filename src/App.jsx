import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import SignIn from "./Components/SignIn";
import SignUp from "./Components/SignUp";
import Profile from "./Components/Profile";
import UserNavbar from "./Components/UserNavbar";
import UserDashboard from "./Components/UserDashboard";
import UserProjects from "./Components/UserProjects";
import ProtectedRoutes from "./ProtectedRoutes";
import { auth } from "../firebase";
import { useUserAuth } from "./Components/UserAuthentication";
import MultiStepForm from "./Components/MultiStepForm";
import UserHeader from "./Components/UserHeader";
import If_PortfolioGenerate from "./Components/If_PortfolioGenerate";
import UserCertificates from "./Components/UserCertificates";
import SetPortfolio from "./Components/SetPortfolio";
import ForgotPassword from "./Components/ForgotPassword";
import PublicLayout from "./Components/PublicLayout";

export default function App() {
  const navigate = useNavigate();
  const { user } = useUserAuth();
const [userName, setUserName] = useState('')
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

  // Sign-out functionality
  const handleSignOut = () => {
    auth.signOut().then(() => navigate("/"));
  };
  
  return (
    <div
      className={`${
        isDarkTheme ? "dark" : "light"
      } relative min-h-screen bg-lightBg dark:bg-darkBg flex w-full`}
    >
      {user ? (
        // Authenticated user layout
        <div className="w-full flex flex-col  text-foreground">
          <UserHeader toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
          <div className="flex w-full min-h-[calc(100svh-72px)] p-2  text-foreground ">
            {/* Sidebar for larger screens */}
            {/* <div className="w-fit bg-gray-200  border-2 border-red-500 rounded-md">
            </div> */}
            {/* Main Content Area */}
            <div className="w-full h-full md-max:w-full  flex text-foreground">
              <UserNavbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme}  >
              <Routes>
                <Route
                  path="/*"
                  element={
                    <ProtectedRoutes>
                      <Routes>
                        <Route path="user/dashboard" element={<UserDashboard />} />
                        <Route path="user/profile" element={<If_PortfolioGenerate />} />
                        <Route path="user/projects" element={<UserProjects />} />
                        <Route path="user/certificate" element={<UserCertificates />} />
                        <Route path="*" element={<div>Page Not Found</div>} />
                      </Routes>
                    </ProtectedRoutes>
                  }
                />
              </Routes>
              </UserNavbar>
            </div>
          </div>
        </div>
      ) : (
        // Public routes for unauthenticated users
        <div className="w-full flex flex-col items-center bg-background  ">
          <Navbar toggleTheme={toggleTheme} isDarkTheme={isDarkTheme}  />
          <Routes>
            <Route path="/" element={<PublicLayout />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset/password" element={<ForgotPassword />} />
            <Route path="/:userName/*" element={<SetPortfolio setUserName={setUserName}/>} />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </div>
      )}
    </div>
  );
}
