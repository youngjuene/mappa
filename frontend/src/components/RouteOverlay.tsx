import React, { useEffect, useRef } from "react";
import type { RouteInfo, TravelMode } from "@/types";

interface RouteOverlayProps {
  map: google.maps.Map;
  route: RouteInfo;
  travelMode: TravelMode;
}

export const RouteOverlay: React.FC<RouteOverlayProps> = ({
  map,
  route,
  travelMode,
}) => {
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create new polyline
    const path = route.path.map(
      (point) => new google.maps.LatLng(point.lat, point.lng)
    );

    polylineRef.current = new google.maps.Polyline({
      path,
      map,
      strokeColor: getRouteColor(travelMode),
      strokeOpacity: 0.8,
      strokeWeight: 4,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: getRouteColor(travelMode),
          },
          offset: "50%",
        },
      ],
    });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, route, travelMode]);

  const getRouteColor = (mode: TravelMode): string => {
    switch (mode) {
      case "WALKING":
        return "#10b981";
      case "BICYCLING":
        return "#f59e0b";
      case "RUNNING":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return null;
};
