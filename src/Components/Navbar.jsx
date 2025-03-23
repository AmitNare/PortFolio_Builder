/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserAuth from "./UserAuthentication";
import logo from "../assets/Images/logo7.webp";

export default function Navbar({ toggleTheme, isDarkTheme, isPortfolioPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut,user } = useUserAuth(); // Access logOut from context
  const [userName, setUserName] = useState(isPortfolioPage || "" );

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

  const handleLogOut = () => {
    logOut(); // Call the logOut function
    localStorage.removeItem("userName"); // Clear userName from localStorage
    setUserName(""); // Clear the local state
    navigate("/signin"); // Redirect to SignIn page after logout
  };

  return (
    <div className="sticky top-2 z-50 w-[99%] h-16 bg-slate-400/10 rounded-xl backdrop-blur-lg bg-opacity-70 flex items-center  ">
      <header className=" relative flex h-full w-full px-12 items-center justify-between gap-4  rounded-xl bg-transparent md:px-20 ">
        <span className="flex my-2 items-center justify-between gap-1 sm-max:ml-4 sm:ml-4">
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

        {/* Desktop navbar */}
        <nav className=" hidden flex-col gap-8 text-xl font-medium md:flex md:flex-row md:items-center md:gap-8 md:text-lg lg:gap-10">
          <ul className="flex space-x-4">
            <li>
              <Link
                to={userName ? `/${userName}#SetHero` : `/#Hero`}
                className="hover:text-foreground text-xl"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to={userName ? `/${userName}#SetProjects` : `/#About`}
                className="hover:text-foreground text-xl"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to={userName ? `/${userName}#SetCertificates` : `/#Features`}
                className="hover:text-foreground text-xl"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to={userName ? `/${userName}#SetEducation` : `/#Feedback`}
                className="hover:text-foreground text-xl"
              >
                Contact
              </Link>
            </li>
            {/* <li>
              <Link
                to={`/${userName}#SetExperience `}
                className="hover:text-foreground text-xl"
              >
                Experience
              </Link>
            </li> */}
          </ul>
        </nav>

        {/* Action Buttons */}
        <section className="flex items-center gap-4">
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
            <>
              {!userName && (
                <>
                  <Button
                    // variant="outline"
                    onClick={() => navigate("/signin")}
                    className="bg-button tracking-wider text-button-textColor hover:bg-button-hover hover:text-button-textColor"
                  >
                    Login
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/signup")}
                    className="border-button tracking-wider text-foreground transition-all duration-300"
                  >
                    Register
                  </Button>
                </>
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
            </>
          )}
        </section>

        {/* Mobile Navbar */}
        <Sheet className="">
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden bg-background text-foreground absolute left-2"
            >
              <Menu className="h-5 w-5  " />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <ul>
                <li>
                  <Link to={`/${userName}#SetHero`} className="text-blue-500">
                    Hero
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetProjects`}
                    className="text-blue-500"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetCertificates`}
                    className="text-blue-500"
                  >
                    Certificates
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetEducation`}
                    className="text-blue-500"
                  >
                    Education
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${userName}#SetExperience`}
                    className="text-blue-500"
                  >
                    Experience
                  </Link>
                </li>
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
    </div>
  );
}
