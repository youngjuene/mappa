import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Plus, X } from "lucide-react";
import type { TravelMode } from "@/types";

interface ProfilePanelProps {
  isOpen: boolean;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen }) => {
  const { getProfiles, currentProfile, setCurrentProfile, createProfile } =
    useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: "",
    travelMode: "WALKING" as TravelMode,
    averageSpeed: 50,
    preferredPaths: [],
    fitnessGoals: [],
  });

  const profiles = getProfiles();

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile(newProfile);
    setIsCreating(false);
    setNewProfile({
      name: "",
      travelMode: "WALKING" as TravelMode,
      averageSpeed: 50,
      preferredPaths: [],
      fitnessGoals: [],
    });
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Profiles</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {isCreating ? (
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Create New Profile</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Name
              </label>
              <input
                type="text"
                value={newProfile.name}
                onChange={(e) =>
                  setNewProfile({ ...newProfile, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Travel Mode
              </label>
              <select
                value={newProfile.travelMode}
                onChange={(e) =>
                  setNewProfile({
                    ...newProfile,
                    travelMode: e.target.value as TravelMode,
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="WALKING">Walking</option>
                <option value="BICYCLING">Bicycling</option>
                <option value="RUNNING">Running</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Speed (km/h)
              </label>
              <input
                type="number"
                value={newProfile.averageSpeed}
                onChange={(e) =>
                  setNewProfile({
                    ...newProfile,
                    averageSpeed: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
                min="1"
                max="200"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create Profile
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setCurrentProfile(profile)}
                className={`w-full p-2 text-left rounded ${
                  currentProfile?.id === profile.id
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
