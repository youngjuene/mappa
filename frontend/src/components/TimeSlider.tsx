import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Clock } from "lucide-react";

interface TimeSliderProps {
  value: number;
  onChange: (value: number) => void;
  timeSlices: { start: number; end: number }[];
  isPlaying: boolean;
  onPlayPause: () => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  value,
  onChange,
  timeSlices,
  isPlaying,
  onPlayPause,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null);

  const updateCurrentTime = useCallback(() => {
    const hours = Math.floor(value);
    const minutes = Math.floor((value % 1) * 60);
    setCurrentTime(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  }, [value]);

  useEffect(() => {
    updateCurrentTime();
  }, [value, updateCurrentTime]);

  useEffect(() => {
    if (isPlaying && !isDragging) {
      const interval = window.setInterval(() => {
        onChange((value + 0.25) % 24);
      }, 1000);
      setAutoPlayInterval(interval);
    } else if (autoPlayInterval) {
      window.clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }

    return () => {
      if (autoPlayInterval) {
        window.clearInterval(autoPlayInterval);
      }
    };
  }, [isPlaying, isDragging, value, onChange]);

  const handleDrag = useCallback(
    (_: any, info: any) => {
      const newValue = Math.max(0, Math.min(23.75, value + info.delta.x / 100));
      onChange(newValue);
    },
    [value, onChange]
  );

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 w-96"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-gray-500" />
          <span className="text-sm font-medium">{currentTime}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlayPause}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </motion.button>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full">
        {timeSlices.map((slice, index) => (
          <div
            key={index}
            className="absolute h-full bg-blue-200"
            style={{
              left: `${(slice.start / 24) * 100}%`,
              width: `${((slice.end - slice.start) / 24) * 100}%`,
            }}
          />
        ))}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-grab"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onDrag={handleDrag}
          style={{
            left: `${(value / 24) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </motion.div>
  );
};
