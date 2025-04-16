import { Card, CardContent } from "./ui/card";
import { Briefcase, Brush, Users, Globe, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
    { icon: <Brush size={40} className="text-blue-500" />, title: "Empowering Creativity", description: "Inspire creativity with intuitive portfolio tools." },
    { icon: <Briefcase size={40} className="text-blue-500" />, title: "Create & Share Portfolios", description: "Craft stunning portfolios and share them with a unique URL." },
    { icon: <Users size={40} className="text-purple-500" />, title: "Team Collaboration", description: "Collaborate with team members on shared projects." },
    { icon: <Globe size={40} className="text-red-500" />, title: "Public Profiles", description: "Establish an online presence with a personalized profile." },
    { icon: <Sparkles size={40} className="text-yellow-500" />, title: "Real-Time Previews", description: "Instantly preview your portfolio updates with live rendering." }
  ];

  return (
    <>
    <h1 className="flex justify-center text-5xl">Features</h1>
    <motion.div 
      className="flex flex-wrap justify-center gap-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {features.map(({ icon, title, description }, index) => (
        <motion.div 
          key={index} 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="flex p-2 md-max:min-w-[300px] "
        >
          <Card className="h-72 w-[400px] md-max:max-w-full rounded-2xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="flex flex-col items-center space-y-4 p-5 h-full justify-center">
              {icon}
              <h3 className="text-2xl font-bold text-gray-300 sm-max:text-xl text-center">{title}</h3>
              <p className="text-center text-base text-gray-500">{description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
          </>
  );
}
