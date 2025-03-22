import React from "react";
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import Theme from "./Theme";
import logo from "../assets/Images/logo7.webp";

export default function UserHeader({ toggleTheme, isDarkTheme, name }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex w-full flex-col items-center justify-between bg-lightBg dark:bg-darkBg">
        <header className="bg-background sticky w-[99%] mt-2 flex h-16 bg-white-400/10 rounded-xl backdrop-blur-lg bg-opacity-70 items-center justify-between gap-4 border px-4 md:px-10">
          {/* <h1 className="text-4xl font-bold text-foreground">{name}</h1> */}

          <span className="flex my-2 items-center justify-between gap-1 md-max:ml-12 ">
            <div className="w-12 h-12 rounded-md overflow-hidden">
              <img
                src={logo}
                alt="logo"
                loading="lazy"
                className="w-full h-full object-cover scale-110 transition-transform duration-300"
              />
            </div>
            <h1 className="text-2xl mt-1 text-foreground font-proxemic">
              Por<span className="text-[#EE4B2B] ">tify</span>{" "}
            </h1>
          </span>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="bg-background text-foreground px-4 py-2"
            title={isDarkTheme ? "Light Theme" : "Dark Theme"}
          >
            {isDarkTheme ? (
              <Sun size={28} color="#ff9933" strokeWidth={1.75} />
            ) : (
              <Moon size={28} color="#0de343" strokeWidth={1.75} />
            )}
          </Button>
        </header>
      </div>
    </>
  );
}
