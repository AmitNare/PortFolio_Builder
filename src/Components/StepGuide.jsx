import { useState, useEffect, useRef } from "react";

const steps = [
  {
    title: "Login Account",
    description:
      "Start by securely logging into your account using your email and password. This ensures your portfolio details are saved and accessible anytime you return.",
  },
  {
    title: "Enter Details",
    description:
      "Fill in your personal and professional information such as your name, profile image, skills, education, experience, and social links. The more details you provide, the better your portfolio will look!",
  },
  {
    title: "Generate Portfolio",
    description:
      "Once your details are filled, our system will automatically create a clean and responsive portfolio layout for you. You can preview how it looks and make any last-minute edits.",
  },
  {
    title: "Go Live",
    description:
      "Your portfolio is now ready to be shared! Publish it with a custom link and showcase your work to the world. You can always come back and update it anytime.",
  },
];

export default function StepGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const [dynamicHeights, setDynamicHeights] = useState({});
  const contentRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const heights = {};
    contentRefs.current.forEach((ref, i) => {
      if (ref) {
        heights[i] = ref.offsetHeight;
      }
    });
    setDynamicHeights(heights);
  }, [activeStep]);

  return (
    <section className="h-[450px] mt-5">

    <div className="p-6 sm-max:p-2 max-w-2xl mx-auto ">
      <h2 className="text-3xl font-bold mb-6">
        Create a Portfolio in 4 Easy Steps
      </h2>

      <div className="space-y-5 w-full">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4">
            {/* Sidebar Progress Bar */}
            <div
              className="relative w-1 bg-blue-100 rounded-md overflow-hidden"
              style={{
                height: dynamicHeights[index] ? `${dynamicHeights[index]}px` : "40px",
                transition: "height 0.3s ease",
              }}
            >
              {index === activeStep && (
                <div className="absolute left-0 top-0 w-full h-full rounded-md bg-gradient-to-b from-blue-400 via-blue-500 to-blue-400 origin-top animate-fillDown" />
              )}
            </div>

            {/* Step Content */}
            <div
              className="w-full sm-max:min-w-72"
              ref={(el) => (contentRefs.current[index] = el)}
            >
              <h3
                className={`text-lg font-bold ${
                  index === activeStep ? "text-button" : ""
                }`}
              >
                {index + 1}. {step.title}
              </h3>
              {index === activeStep && step.description && (
                <p className="text-sm text-button transition-opacity duration-500">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </section>
  );
}
