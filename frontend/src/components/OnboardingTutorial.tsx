import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

const steps = [
  {
    icon: MapPin,
    title: "Explore Your Reach",
    description:
      "See how far you can go in your chosen time frame, with distances warped to show real travel times.",
  },
  {
    icon: Clock,
    title: "Time Travel",
    description:
      "Use the time slider to see how your reachable area changes throughout the day.",
  },
  {
    icon: Users,
    title: "Discover Popular Routes",
    description:
      "Find the most popular paths and points of interest within your reach.",
  },
];

export const OnboardingTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { createProfile } = useAppStore();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    try {
      console.log("Creating default profile...");
      createProfile({
        name: "Default Profile",
        travelMode: "WALKING",
        averageSpeed: 50,
        preferredPaths: [],
        fitnessGoals: [],
      });
      console.log("Profile created successfully");
      toast.success("Profile created! Welcome to Mappa!");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(steps[currentStep].icon, {
                className: "w-8 h-8 text-primary-500",
              })}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>

            <p className="text-gray-600 mb-6">
              {steps[currentStep].description}
            </p>

            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                className={`px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                  currentStep === 0 ? "invisible" : ""
                }`}
              >
                Back
              </button>

              <div className="flex items-center space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-primary-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={
                  currentStep === steps.length - 1 ? handleGetStarted : nextStep
                }
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <span>
                  {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                </span>
                {currentStep < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
