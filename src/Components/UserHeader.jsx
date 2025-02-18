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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import Theme from "./Theme";

export default function UserHeader(
  { toggleTheme, isDarkTheme, name }
) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex w-full flex-col justify-between">
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-20">
          {/* <h1 className="text-4xl font-bold text-foreground">{name}</h1> */}

          <h1 className="text-4xl font-bold text-foreground">Port</h1>

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
