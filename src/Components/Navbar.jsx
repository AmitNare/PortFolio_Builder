/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserAuth from "./UserAuthentication";
import logo from "../assets/Images/logo7.webp";

export default function Navbar({ toggleTheme, isDarkTheme, isPortfolioPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut, user } = useUserAuth(); // Access logOut from context
  const [userName, setUserName] = useState(isPortfolioPage || "");

  // Retrieve userName from localStorage on mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Apply the dark or light theme when the component mounts
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkTheme]);

  // Scroll to the section corresponding to the hash fragment in the URL
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.documentElement.classList.add("overflow-hidden");
      document.body.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  // const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const handleLogOut = () => {
    logOut(); // Call the logOut function
    localStorage.removeItem("userName"); // Clear userName from localStorage
    setUserName(""); // Clear the local state
    navigate("/signin"); // Redirect to SignIn page after logout
  };

  return (
    <div className="sticky top-2 md-max:top-0 z-50 w-[99%] sm-max:w-full h-16 bg-slate-400/10 rounded-xl sm-max:rounded-none backdrop-blur-lg bg-opacity-70 flex items-center  ">
      <header className="  relative flex h-full w-full px-12 items-center justify-between gap-2 2md-min:gap-4  rounded-xl bg-transparent md:px-5 lg:px-20 ">
        <span className="flex my-2 items-center justify-between gap-1 sm-max:ml-4 2md-min:ml-4">
          <div className="w-12 h-12 rounded-md overflow-hidden ">
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

        {/* Desktop navbar */}
        <nav className=" hidden flex-col text-xl font-medium md:flex md:flex-row md:items-center md:text-lg gap-0 2md-min:gap-8 md:gap-0 lg:gap-10">
          <ul className="flex md:space-x-2 lg:space-x-4">
            {userName ? (
              <>
                <li>
                  <Link
                    to={`/${userName}#SetHero`}
                    className="hover:text-foreground text-xl"
                  >
                    Hero
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetProjects`}
                    className="hover:text-foreground text-xl"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetCertificates`}
                    className="hover:text-foreground text-xl"
                  >
                    Certificates
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetEducation`}
                    className="hover:text-foreground text-xl"
                  >
                    Education
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetExperience`}
                    className="hover:text-foreground text-xl"
                  >
                    Experience
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={`/#Hero`} className="hover:text-foreground text-xl">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/#About`}
                    className="hover:text-foreground text-xl"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/#Features`}
                    className="hover:text-foreground text-xl"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/#Feedback`}
                    className="hover:text-foreground text-xl"
                  >
                    Contact
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Action Buttons */}
        <section className="flex items-center gap-1 md-max:hidden 2md-min:gap-3 lg:gap-4">
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

          {/* No Buttons on Portfolio Page */}
          {!isPortfolioPage && (
            <div className="flex">
              {!userName && (
                <div className="flex md:gap-1 2md-min:gap-3 lg:gap-4">
                  <Button
                    // variant="default"
                    onClick={() => navigate("/signin")}
                    className="bg-button tracking-wider text-button-textColor hover:bg-button-hover hover:text-button-textColor rounded-md"
                  >
                    Login
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/signup")}
                    className="border-button tracking-wider text-foreground transition-all duration-300 rounded-md"
                  >
                    Register
                  </Button>
                </div>
              )}

              {userName && (
                <Button
                  variant="outline"
                  onClick={handleLogOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Logout
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Mobile Navbar */}
        {/* Mobile Sidebar Button */}
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden bg-background text-foreground absolute left-2"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        {/* Sidebar Overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}

        {/* Sidebar Panel */}
        <div
          className={`fixed top-0 -left-1 h-svh w-full  bg-gray-500 z-50 shadow-lg transition-transform duration-300 md:hidden ${
            open ? "translate-x-0 " : "-translate-x-full"
          }`}
        >
          <nav className="w-full text-lg font-medium  bg-gray-500 ">
            <X
              size={28}
              onClick={handleClose}
              className="absolute top-5 right-5"
            />

            <ul className="flex flex-col mt-20 items-center">
              {userName ? (
                <>
                  <li>
                    <Link to={`/${userName}#SetHero`} onClick={handleClose}>
                      Hero
                    </Link>
                  </li>
                  <li>
                    <Link to={`/${userName}#SetProjects`} onClick={handleClose}>
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/${userName}#SetCertificates`}
                      onClick={handleClose}
                    >
                      Certificates
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/${userName}#SetEducation`}
                      onClick={handleClose}
                    >
                      Education
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/${userName}#SetExperience`}
                      onClick={handleClose}
                    >
                      Experience
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to={`/#Hero`} onClick={handleClose}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to={`/#About`} onClick={handleClose}>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to={`/#Features`} onClick={handleClose}>
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to={`/#Feedback`} onClick={handleClose}>
                      Contact
                    </Link>
                  </li>
                  <li className="mt-4">
                    <Button
                      onClick={() => {
                        navigate("/signin");
                        handleClose();
                      }}
                      className="w-full bg-button text-button-textColor"
                    >
                      Login
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/signup");
                        handleClose();
                      }}
                      className="w-full"
                    >
                      Register
                    </Button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
    </div>
  );
}
