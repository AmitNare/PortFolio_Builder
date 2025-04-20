/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserAuth from "./UserAuthentication";
import logo from "../assets/Images/logo7.webp";

const sections = [
  { id: "Hero", label: "Home" },
  { id: "About", label: "About" },
  { id: "Features", label: "Features" },
  { id: "Feedback", label: "Contact" },
];

const portfolioSections = [
  { id: "SetHero", label: "Hero" },
  { id: "SetProjects", label: "Projects" },
  { id: "SetCertificates", label: "Certificates" },
  { id: "SetEducation", label: "Education" },
  { id: "SetExperience", label: "Experience" },
];

export default function Navbar({ toggleTheme, isDarkTheme, isPortfolioPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut, user } = useUserAuth();
  const [userName, setUserName] = useState(isPortfolioPage || "");
  const [activeSection, setActiveSection] = useState("Hero");
  const [open, setOpen] = useState(false);

  // Fetch user from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Theme mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme);
  }, [isDarkTheme]);

  // Smooth scroll on hash change
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  // Lock scroll on mobile sidebar open
  useEffect(() => {
    const classList = document.documentElement.classList;
    const bodyClass = document.body.classList;

    if (open) {
      classList.add("overflow-hidden");
      bodyClass.add("overflow-hidden");
    } else {
      classList.remove("overflow-hidden");
      bodyClass.remove("overflow-hidden");
    }

    return () => {
      classList.remove("overflow-hidden");
      bodyClass.remove("overflow-hidden");
    };
  }, [open]);

  // Handle logout
  const handleLogOut = () => {
    logOut();
    localStorage.removeItem("userName");
    setUserName("");
    navigate("/signin");
  };

  // Intersection observer for active section detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        threshold: 0.5,
      }
    );

    const allSections = document.querySelectorAll("section[id]");
    allSections.forEach((section) => observer.observe(section));

    return () => allSections.forEach((section) => observer.unobserve(section));
  }, []);

  const navItems = userName ? portfolioSections : sections;

  return (
    <div
      data-aos="fade-down"
      className="sticky top-2 md-max:top-0 z-50 w-[99%] sm-max:w-full h-16 bg-slate-400/10 rounded-xl sm-max:rounded-none backdrop-blur-lg bg-opacity-70 flex items-center"
    >
      <header className="relative flex h-full w-full px-12 items-center justify-between gap-2 2md-min:gap-4 rounded-xl bg-transparent md:px-5 lg:px-20">
        {/* Logo */}
        <span className="flex my-2 items-center gap-1 sm-max:ml-4 2md-min:ml-4">
          <div className="w-12 h-12 rounded-md overflow-hidden">
            <img
              src={logo}
              alt="logo"
              loading="lazy"
              className="w-full h-full object-cover scale-110 transition-transform duration-300"
            />
          </div>
          <h1 className="text-2xl mt-1 text-foreground font-proxemic">
            Por<span className="text-[#EE4B2B]">tify</span>
          </h1>
        </span>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-row items-center text-xl font-medium gap-6 lg:gap-10">
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/${userName || ""}#${item.id}`}
                  className={`hover:text-[#EE4B2B] transition-colors duration-300 ${
                    activeSection === item.id ? "text-[#EE4B2B] font-semibold underline underline-offset-4" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Buttons */}
        <section className="flex items-center gap-2 md-max:hidden">
          {/* Theme toggle */}
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

          {!isPortfolioPage && (
            <div className="flex">
              {!userName ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/signin")}
                    className="bg-button tracking-wider text-button-textColor hover:bg-button-hover"
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/signup")}
                    className="border-button tracking-wider"
                  >
                    Register
                  </Button>
                </div>
              ) : (
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

        {/* Mobile Nav Button */}
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden absolute left-2"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        {/* Mobile Overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 -left-1 h-svh w-full bg-gray-500 z-50 shadow-lg transition-transform duration-300 md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="w-full text-lg font-medium bg-gray-500">
            <X size={28} onClick={() => setOpen(false)} className="absolute top-5 right-5" />

            <ul className="flex flex-col mt-20 items-center space-y-4">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/${userName || ""}#${item.id}`}
                    onClick={() => setOpen(false)}
                    className={`${
                      activeSection === item.id ? "text-[#EE4B2B] font-semibold underline underline-offset-4" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {!isPortfolioPage && (
                <>
                  {!userName && (
                    <>
                      <li>
                        <Button
                          onClick={() => {
                            navigate("/signin");
                            setOpen(false);
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
                            setOpen(false);
                          }}
                          className="w-full"
                        >
                          Register
                        </Button>
                      </li>
                    </>
                  )}
                  {userName && (
                    <li>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleLogOut();
                          setOpen(false);
                        }}
                        className="w-full"
                      >
                        Logout
                      </Button>
                    </li>
                  )}
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
    </div>
  );
}
