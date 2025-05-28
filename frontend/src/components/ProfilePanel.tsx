import React from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

interface ProfilePanelProps {
  isOpen: boolean;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen }) => {
  const { profiles, selectedProfile, setSelectedProfile } = useAppStore();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50"
    >
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Profiles</h2>
        <div className="space-y-2">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className={`w-full p-2 text-left rounded ${
                selectedProfile?.id === profile.id
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {profile.name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
