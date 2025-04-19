import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import SetHero from "./SetHero";
import SetExperience from "./SetExperience";
import SetEducation from "./SetEducation";
import SetProjects from "./SetProjects";
import SetCertificates from "./SetCertificates";
import { useLocation, useParams, Link, Navigate } from "react-router-dom";
import Hero from "./Hero";
import About from "./About";
import Features from "./Features";
import Feedback from "./Feedback";
import Footer from "./Footer";
import FooterS from "./Footer";
import useUserAuth from "./UserAuthentication";
import StepGuide from "./StepGuide";
import RippleCursor from "@/cursor/RippleCursor";
import CanvasCursor from "@/cursor/CanvasCursor";

export default function PublicLayout() {
  const { user } = useUserAuth();
  const location = useLocation(); // Get the current location
  const [loading, setLoading] = useState(true); // Show loading state

  // Scroll to the section specified in the hash
  //   useEffect(() => {
  //     console.log("PublicLayout page")
  //     const scrollToSection = () => {
  //       if (location.hash) {
  //         const element = document.querySelector(location.hash);
  //         if (element) {
  //           element.scrollIntoView({ behavior: "smooth" });
  //         }
  //       } else {
  //         window.scrollTo(0, 0);
  //       }
  //     };

  //     scrollToSection();
  //   }, [location]);

  // Handle loading state
  //   if (loading) {
  //     return <div>Loading...</div>;
  //   }

  // Handle error state
  //   if (error) {
  //     return <div className="text-red-500">{error}</div>;
  //   }

  return user ? (
    <Navigate to='/user/profile' />
  )
  : (
    <div className="p-2  w-full min-h-screen flex flex-col text-foreground bg-background">
      <section id="Hero">
        <Hero />
      </section>
      <section id="About" className="">
        <About />
      </section>
      <section className="">
        <StepGuide />
      </section>
      <section id="Features" className="">
        <Features />
      </section>
      <section id="Feedback" className="">
        <Feedback />
      </section>
      <section className="">
        <FooterS />
      </section>
      <CanvasCursor/>
    </div>
  );
}
