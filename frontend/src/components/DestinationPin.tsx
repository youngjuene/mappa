import React, { useEffect, useRef } from "react";
import type { LatLng, RouteInfo } from "@/types";

interface DestinationPinProps {
  map: google.maps.Map;
  position: LatLng;
  routeInfo?: RouteInfo;
}

export const DestinationPin: React.FC<DestinationPinProps> = ({
  map,
  position,
  routeInfo,
}) => {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: { lat: position.lat, lng: position.lng },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#FF5252",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    if (routeInfo) {
      infoWindowRef.current = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">Destination</h3>
            <p class="text-sm">Distance: ${routeInfo.distance} km</p>
            <p class="text-sm">Duration: ${routeInfo.duration} min</p>
          </div>
        `,
      });

      markerRef.current.addListener("click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.open(map, markerRef.current);
        }
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [map, position, routeInfo]);

  return null;
};
