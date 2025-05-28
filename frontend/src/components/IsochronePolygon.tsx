import React, { useEffect, useRef } from "react";
import type { LatLng } from "@/types";

interface IsochronePolygonProps {
  map: google.maps.Map;
  path: LatLng[];
  color: string;
  opacity: number;
  distortion: number;
}

export const IsochronePolygon: React.FC<IsochronePolygonProps> = ({
  map,
  path,
  color,
  opacity,
  distortion,
}) => {
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    // Clear existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    // Apply distortion to path if needed
    const distortedPath =
      distortion > 0
        ? path.map((point) => ({
            lat: point.lat + (Math.random() - 0.5) * distortion * 0.001,
            lng: point.lng + (Math.random() - 0.5) * distortion * 0.001,
          }))
        : path;

    // Create new polygon
    polygonRef.current = new google.maps.Polygon({
      paths: distortedPath,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: opacity * 0.2,
      map,
    });

    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
    };
  }, [map, path, color, opacity, distortion]);

  return null;
};
