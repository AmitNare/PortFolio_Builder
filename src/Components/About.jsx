import { Card, CardContent } from "./ui/card";
import { Target, TrendingUp, Rocket, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import about_us_img from "../assets/Images/about_us_img.jpg";

export default function About() {
  const visions = [
    {
      icon: <Target size={40} className="text-blue-500" />,
      title: "Empowering Creators",
      description:
        "Continuously expand features to help users craft unique portfolios effortlessly.",
    },
    {
      icon: <TrendingUp size={40} className="text-green-500" />,
      title: "Global Community",
      description:
        "Foster a vibrant community of creators sharing knowledge and inspiration.",
    },
    {
      icon: <Rocket size={40} className="text-purple-500" />,
      title: "Innovative Tools",
      description:
        "Integrate cutting-edge technologies to enhance portfolio customization and engagement.",
    },
    {
      icon: <Lightbulb size={40} className="text-yellow-500" />,
      title: " Custom Domain Support",
      description:
        "Connect your own domain (e.g., https://portify.com/username).SSL security included..",
    },
  ];

  return (
    <>
      <div className=" text-foreground bg-background">
        <h1 className="flex justify-center text-5xl">About</h1>
        <div className="flex md-max:flex-col justify-center items-center md-max:gap-5 md:gap-5 lg:gap-10 sm:p-2 lg:p-5">
          <img
            src={about_us_img}
            alt=""
            className="w-full md-max:max-w-lg md:max-w-96 lg:max-w-lg xl:max-w-xl aspect-video"
          />
          <span className="w-full border-l-2 border-l-slate-500 pl-2 max-w-[700px] md-max:text-sm md:text-sm lg:text-[16px] xl:text-lg">
            Welcome to Portify, your one-stop solution for building a
            professional portfolio website without writing a single line of
            code. Portify is a simple tool that helps you create your own
            professional portfolio website without any coding. Just enter your
            details and we’ll turn it into a clean, mobile-friendly portfolio
            with your own custom link. Perfect for students, job seekers, and
            professionals who want to showcase their work online easily. We
            believe everyone deserves a digital space to present themselves,
            even without technical knowledge. That’s why Portify is simple,
            fast, and user-friendly — helping you create a complete personal
            website in just a few clicks. Whether you're applying for jobs,
            internships, or just want to build your personal brand, Portify
            helps you stand out.
          </span>
        </div>
      </div>
    </>
  );
}
