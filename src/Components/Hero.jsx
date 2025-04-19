import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Sparkles, Rocket } from "lucide-react";

export default function Hero() {
    const navigate = useNavigate();
  
  return (
    <section className=" text-foreground min-h-[50em] h-auto flex flex-col items-center justify-center text-center bg-background mb-12">
      <div className="animate-bounce ">
        <Rocket size={80} className="  drop-shadow-xl text-purple-500" />
      </div>
      <h1 className="text-6xl font-black mb-5 leading-tight drop-shadow-2xl sm-max:text-3xl tracking-wider">
        Build A Portfolio That Shines
      </h1>
      <p className="text-lg mb-7 max-w-xl font-semibold opacity-95 leading-relaxed sm-max:text-lg">
        Create a stunning showcase of your skills and achievements with ease.
        Stand out from the crowd and leave a lasting impression.
      </p>
      <div className="flex space-x-6 mb-32">
        <Button 
          onClick={() => navigate("/signin")}
          className="bg-button text-button-textColor px-8 sm-max:px-4 py-6 sm-max:py-2 text-xl sm-max:text-lg rounded-full shadow-2xl hover:bg-button-hover hover:-translate-y-1 transition-all duration-300">
          Get Started
        </Button>
        <Button
          variant="outline"
          className="border-button text-foreground px-8 sm-max:px-4 py-6 sm-max:py-2 rounded-full shadow-2xl  text-xl sm-max:text-lg hover:-translate-y-1 transition-all duration-300"
          onClick={() => navigate("/#About")}
        >
          Learn More
        </Button>
      </div>
      {/* <div className="absolute bottom-5 text-sm text-gray-300 opacity-80">
        Trusted by thousands of professionals worldwide.
      </div> */}
    </section>
  );
}
