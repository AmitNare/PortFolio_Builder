import { Card, CardContent } from "./ui/card";
import { Briefcase, Brush, Users, Globe, Sparkles } from "lucide-react";
import { Target, TrendingUp, Rocket, Lightbulb } from "lucide-react";

import { motion } from "framer-motion";

export default function Features() {
  const features = [
    { icon: <Target size={40} className="text-blue-500" />, title: "Empowering Creators", description: "Continuously expand features to help users craft unique portfolios effortlessly." },
    { icon: <Rocket size={40} className="text-purple-500" />, title: "Innovative Tools", description: "Integrate cutting-edge technologies to enhance portfolio customization and engagement." },
    { icon: <Lightbulb size={40} className="text-yellow-500" />, title: " Custom Domain Support", description: "Connect your own domain (e.g., https://portify.com/username).SSL security included.." },
    { icon: <Briefcase size={40} className="text-blue-500" />, title: "Create & Share Portfolios", description: "Craft stunning portfolios and share them with a unique URL." },
    { icon: <Globe size={40} className="text-red-500" />, title: "Public Profiles", description: "Establish an online presence with a personalized profile." },
    { icon: <Sparkles size={40} className="text-yellow-500" />, title: "Real-Time Previews", description: "Instantly preview your portfolio updates with live rendering." }
  ];

  return (
    <>
    <h1 className="flex justify-center text-5xl mt-8">Features</h1>
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
          <Card className="h-72 w-[350px] md-max:max-w-full rounded-2xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="flex flex-col items-center space-y-4 p-5 h-full justify-center">
              {icon}
              <h3 className="text-2xl font-bold text-foreground sm-max:text-xl text-center">{title}</h3>
              <p className="text-center text-base text-gray-600">{description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
          </>
  );
}
