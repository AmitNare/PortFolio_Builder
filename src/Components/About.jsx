import { Card, CardContent } from "./ui/card";
import { Target, TrendingUp, Rocket, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const visions = [
    { icon: <Target size={40} className="text-blue-500" />, title: "Empowering Creators", description: "Continuously expand features to help users craft unique portfolios effortlessly." },
    { icon: <TrendingUp size={40} className="text-green-500" />, title: "Global Community", description: "Foster a vibrant community of creators sharing knowledge and inspiration." },
    { icon: <Rocket size={40} className="text-purple-500" />, title: "Innovative Tools", description: "Integrate cutting-edge technologies to enhance portfolio customization and engagement." },
    { icon: <Lightbulb size={40} className="text-yellow-500" />, title: "Lifelong Learning", description: "Offer resources and insights to help users grow their skills and careers." }
  ];

  return (
    <>
    <div className=" text-foreground bg-background">

    <h1 className="flex justify-center text-5xl">About</h1>
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      >
      {visions.map(({ icon, title, description }, index) => (
        <motion.div key={index} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-2xl transition-shadow duration-300 border border-gray-200 rounded-2xl h-64 w-full">
            <CardContent className="flex flex-col items-center space-y-4 p-5 h-full justify-center">
              {icon}
              <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
              <p className="text-center text-base text-gray-500">{description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
      </div>
      </>
  );
}
