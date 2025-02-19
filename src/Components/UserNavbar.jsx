import React, { useState } from "react";
import { Moon, Sun, Home, Briefcase, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "./UserAuthentication";

export default function UserNavbar({ toggleTheme, isDarkTheme, children }) {
  const { logOut } = useUserAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("/user/dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigation = (path) => {
    setSelected(path);
    path === "logout" ? logOut().then(() => navigate("/login")) : navigate(path);
    setIsSidebarOpen(false);
  };

  const navItems = [
    { label: 'Dashboard', path: '/user/dashboard', icon: Home },
    { label: 'Projects', path: '/user/projects', icon: Briefcase },
    { label: 'Profile', path: '/user/profile', icon: User }
  ];

  return (
    <div className="flex h-full  w-full gap-2">
      {/* Sidebar */}
      <aside className={` inset-y-0 left-0 w-64 md-max:w border-2 rounded-md h-full p-6 bg-background transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 `}>
        <div className="flex justify-between items-center mb-6">
          {/* <h2 className="text-3xl font-bold">Portify</h2> */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <X size={28} />
          </button>
        </div>
        <nav className="space-y-4 text-lg font-semibold">
          {navItems.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              className={`w-full flex items-center px-4 py-2 rounded-md ${selected === path ? 'bg-button text-button-textColor' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              onClick={() => handleNavigation(path)}
            >
              <Icon className="mr-2" /> {label}
            </button>
          ))}
          <button onClick={() => handleNavigation('logout')} className="flex items-center px-4 py-2 hover:text-red-500">
            <LogOut className="mr-2" /> Logout
          </button>
        </nav>
        <Button variant="ghost" onClick={toggleTheme} className="mt-6">
          {isDarkTheme ? <Sun className="mr-2" /> : <Moon className="mr-2" />} {isDarkTheme ? "Light Mode" : "Dark Mode"}
        </Button>
      </aside>

      {/* Hamburger Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-background rounded-full">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 gap-2 rounded-md border bg-background md-max:w-full">{children}</main>
    </div>
  );
}
