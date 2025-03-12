import React, { useState } from "react";
import {
  Moon,
  Sun,
  Home,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  Sparkles,
  AwardIcon,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "./UserAuthentication";
import Chatbot from "./Chatbot"; // Assuming you have a Chatbot component
import ChatGPT from "./ChatGPT";

export default function UserNavbar({ toggleTheme, isDarkTheme, children }) {
  const { logOut, userDetails } = useUserAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("/user/profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleNavigation = (path) => {
    setSelected(path);
    if (path === "logout") {
      logOut().then(() => navigate("/signin"));
    } else {
      navigate(path);
    }
    setIsSidebarOpen(false);
  };

  const handleSettings = () => {
    navigate('/user/settings');
  }

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const navItems = [
    { label: "Profile", path: "/user/profile", icon: User },
    { label: "Projects", path: "/user/projects", icon: Briefcase },
    { label: "Achivement", path: "/user/certificates", icon: AwardIcon },
    { label: "Features", path: "/user/features", icon: Boxes },
    { label: "Preview", path: "/user/preview", icon: Home },
  ];

  return (
    <div className="flex h-full w-full gap-2 ">
      {/* Sidebar */}
      <aside
        className={`inset-y-0 left-0 w-64 border flex flex-col justify-between items-baseline rounded-md h-auto px-3 py-4 bg-background transition-transform md-max:absolute md-max:z-[99] sm-max:w-[100%] ${
          isSidebarOpen ? "translate-x-0 " : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* <div className="flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <X size={28} />
          </button>
        </div> */}
        <nav className={`flex-auto flex flex-col text-lg font-semibold gap-4 w-full mt-2 ${
          isSidebarOpen ? "mt-20 " : ""
        }`}>
          {navItems.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              className={`w-full flex items-center px-4 py-2 rounded-md ${
                selected === path
                  ? "bg-button text-button-textColor"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleNavigation(path)}
            >
              <Icon className="mr-2" /> {label}
            </button>
          ))}
          <button
            onClick={() => handleNavigation("logout")}
            className="flex items-center px-4 py-2 hover:text-red-500"
          >
            <LogOut className="mr-2" /> Logout
          </button>
        </nav>
        <Button variant="ghost" onClick={toggleTheme} className="mt-6">
          {isDarkTheme ? <Sun className="mr-2" /> : <Moon className="mr-2" />} {" "}
          {isDarkTheme ? "Light Mode" : "Dark Mode"}
        </Button>

      {userDetails && 
        <span className="flex my-2 items-center justify-between gap-1">
      <div className="w-12 h-12 rounded-md overflow-hidden">
        {userDetails ? (
          <img
            src={userDetails.image || ""}
            alt="User Avatar"
            loading="lazy"
            className="w-full h-full object-cover scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Loading...</span>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        {userDetails ? (
          <>
            <h1 className="text-xl text-foreground ">
              {userDetails.name} {userDetails.surname}
            </h1>
            <p className="text-sm text-gray-500">{userDetails.currentJobRole}</p>
          </>
        ) : (
          <span className="text-gray-500">Loading details...</span>
        )}
      </div>
      <button
        onClick={handleSettings} // Replace with your settings function
        className="ml-4 p-2 rounded-md hover:bg-gray-200 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 text-gray-700"  />
      </button>
    </span>
  }

      </aside>

      {/* Hamburger Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden mb-5 md-max:z-[99]">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-background rounded-full "
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content Area */}
      <main  className="flex-1 gap-2 rounded-md  bg-lightBg dark:bg-darkBg md-max:w-full relative flex min-h-[calc(100svh-88px)]">
        <div className="flex-1 border rounded-md h-full bg-background">{children}</div>
        {isChatbotOpen && (
          <div className="w-1/4 md-max:absolute md-max:z-50 md-max:h-full md-max:w-full border rounded-md  bg-background p-4">
            <ChatGPT />
          </div>
        )}
        <button
          onClick={toggleChatbot}
          className="absolute right-10 bottom-10 z-50 flex items-center p-2 w-fit bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <Sparkles className="text-button hover:text-button" />
        </button>
      </main>
    </div>
  );
}
