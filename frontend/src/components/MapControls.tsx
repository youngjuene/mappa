import React from "react";
import { Layers, Clock, Settings, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";

interface MapControlsProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleMode: () => void;
  onToggleHeatmap: () => void;
  onToggleTimeSlice: () => void;
  onToggleSettings: () => void;
  showHeatmap: boolean;
  showTimeSlice: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isExpanded,
  onToggleExpand,
  onToggleMode,
  onToggleHeatmap,
  onToggleTimeSlice,
  onToggleSettings,
  showHeatmap,
  showTimeSlice,
}) => {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed right-4 top-4 z-50 flex flex-col gap-2"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleExpand}
        className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-50"
      >
        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </motion.button>

      {isExpanded && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleMode}
            className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-50"
          >
            <Layers size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleHeatmap}
            className={`rounded-full p-2 shadow-lg ${
              showHeatmap
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <Layers size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleTimeSlice}
            className={`rounded-full p-2 shadow-lg ${
              showTimeSlice
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <Clock size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSettings}
            className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-50"
          >
            <Settings size={20} />
          </motion.button>
        </>
      )}
    </motion.div>
  );
};
