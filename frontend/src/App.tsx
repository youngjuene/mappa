import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { MapContainer } from "./components/MapContainer";
import { TimeSlider } from "./components/TimeSlider";
import { ProfilePanel } from "./components/ProfilePanel";
import "./App.css";

export const App: React.FC = () => {
  const {
    currentProfile,
    selectedTimeSlice,
    setSelectedTimeSlice,
    getTimeSlices,
  } = useAppStore();
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Convert selectedTimeSlice to a value between 0 and 1 for the slider
  const timeSlices = getTimeSlices();
  const currentIndex = timeSlices.findIndex(
    (slice) => slice.label === selectedTimeSlice.label
  );
  const value =
    currentIndex === -1 ? 0 : currentIndex / (timeSlices.length - 1);

  const handleSliderChange = (newValue: number) => {
    const idx = Math.round(newValue * (timeSlices.length - 1));
    setSelectedTimeSlice(timeSlices[idx]);
  };

  const handlePlayPause = () => setIsPlaying((p) => !p);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-40 relative">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mappa</h1>
              <p className="text-xs text-gray-500">Isochrone Explorer</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentProfile && (
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <div
                  className={`w-3 h-3 rounded-full bg-isochrone-${currentProfile.travelMode.toLowerCase()}`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {currentProfile.name}
                </span>
              </div>
            )}

            <button
              onClick={() => setIsProfilePanelOpen(!isProfilePanelOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700">
                Profiles
              </span>
            </button>

            <ProfilePanel isOpen={isProfilePanelOpen} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Map Container */}
        <MapContainer className="absolute inset-0" />

        {/* Time Slider */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <TimeSlider
            value={value}
            onChange={handleSliderChange}
            timeSlices={timeSlices}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
        </div>
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#374151",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e5e7eb",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

export default App;
