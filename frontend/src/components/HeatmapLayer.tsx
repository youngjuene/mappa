import React, { useEffect, useRef } from "react";
import type { LatLng } from "@/types";

interface HeatmapLayerProps {
  map: google.maps.Map;
  data: Array<{
    position: LatLng;
    weight: number;
  }>;
  opacity?: number;
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  map,
  data,
  opacity = 0.6,
}) => {
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(
    null
  );

  useEffect(() => {
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
    }

    const heatmapData = data.map((point) => ({
      location: new google.maps.LatLng(point.position.lat, point.position.lng),
      weight: point.weight,
    }));

    heatmapRef.current = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map,
      opacity,
      radius: 20,
    });

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
    };
  }, [map, data, opacity]);

  return null;
};
