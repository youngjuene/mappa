import React, { useEffect, useRef } from "react";
import type { LatLng } from "@/types";

interface POILayerProps {
  map: google.maps.Map;
  pois: Array<{
    id: string;
    name: string;
    type: string;
    position: LatLng;
    rating?: number;
    estimatedTime?: number;
  }>;
}

export const POILayer: React.FC<POILayerProps> = ({ map, pois }) => {
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create new markers for each POI
    pois.forEach((poi) => {
      const marker = new google.maps.Marker({
        position: { lat: poi.position.lat, lng: poi.position.lng },
        map,
        title: poi.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getPOIColor(poi.type),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${poi.name}</h3>
            <p class="text-sm text-gray-600">${poi.type}</p>
            ${
              poi.rating ? `<p class="text-sm">Rating: ${poi.rating}/5</p>` : ""
            }
            ${
              poi.estimatedTime
                ? `<p class="text-sm">Time: ${poi.estimatedTime} min</p>`
                : ""
            }
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [map, pois]);

  const getPOIColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "restaurant":
        return "#FF5252";
      case "cafe":
        return "#FFD740";
      case "park":
        return "#4CAF50";
      case "museum":
        return "#2196F3";
      case "shopping":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  return null;
};
