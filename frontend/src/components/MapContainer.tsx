import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { googleMapsService } from "@/utils/googleMaps";
import { useAppStore } from "@/store/useAppStore";
import { MapControls } from "./MapControls";
import { IsochronePolygon } from "./IsochronePolygon";
import { HeatmapLayer } from "./HeatmapLayer";
import { POILayer } from "./POILayer";
import { RouteOverlay } from "./RouteOverlay";
import { DestinationPin } from "./DestinationPin";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import toast from "react-hot-toast";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import type { IsochroneOptions, LatLng, RouteInfo } from "@/types";

interface MapContainerProps {
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

export const MapContainer: React.FC<MapContainerProps> = ({
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [destinationPin, setDestinationPin] = useState<LatLng | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | undefined>(undefined);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTimeSlice, setShowTimeSlice] = useState(false);
  const {
    mapViewState,
    currentProfile,
    activeIsochrone,
    selectedTimeSlice,
    isLoading,
    error,
    setActiveIsochrone,
    setLoading,
    setError,
    updateMapViewState,
    setPOIs,
    pois,
  } = useAppStore();

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        setLoading(true);
        const map = await googleMapsService.initialize(
          mapRef.current,
          mapViewState.center
        );
        mapInstanceRef.current = map;

        // Set up map event listeners
        setupMapListeners(map);

        setIsMapLoaded(true);
        setError(null);
        toast.success("Map loaded successfully!");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load map";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
  }, []);

  // Set up map event listeners
  const setupMapListeners = useCallback(
    (map: google.maps.Map) => {
      // Handle map center changes
      map.addListener("center_changed", () => {
        const center = map.getCenter();
        if (center) {
          updateMapViewState({
            center: { lat: center.lat(), lng: center.lng() },
          });
        }
      });

      // Handle zoom changes
      map.addListener("zoom_changed", () => {
        updateMapViewState({ zoom: map.getZoom() || 13 });
      });

      // Handle long press for destination pin
      let pressTimer: number;

      map.addListener("mousedown", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          pressTimer = window.setTimeout(() => {
            handleLongPress(e.latLng!);
          }, 500);
        }
      });

      map.addListener("mouseup", () => {
        window.clearTimeout(pressTimer);
      });

      map.addListener("mousemove", () => {
        window.clearTimeout(pressTimer);
      });

      // Handle single tap for flat/spacetime view toggle
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng && !destinationPin) {
          // Only toggle if not placing a destination pin
          window.setTimeout(() => {
            if (!destinationPin) {
              toggleMapView();
            }
          }, 100);
        }
      });
    },
    [destinationPin, updateMapViewState]
  );

  // Handle long press for destination pin
  const handleLongPress = useCallback(
    async (latLng: google.maps.LatLng) => {
      const position = { lat: latLng.lat(), lng: latLng.lng() };
      setDestinationPin(position);

      if (currentProfile && activeIsochrone) {
        try {
          setLoading(true);
          const route = await googleMapsService.calculateRoute(
            mapViewState.center,
            position,
            currentProfile.travelMode
          );
          setRouteInfo(route);

          toast.success(
            `Route calculated: ${
              Math.round((route.distance / 1000) * 10) / 10
            }km in ${Math.round(route.duration / 60)}min`
          );
        } catch (err) {
          toast.error("Failed to calculate route");
        } finally {
          setLoading(false);
        }
      }
    },
    [currentProfile, activeIsochrone, mapViewState.center, setLoading]
  );

  // Toggle between flat and spacetime view
  const toggleMapView = useCallback(() => {
    updateMapViewState({ isDistorted: !mapViewState.isDistorted });

    if (mapViewState.isDistorted) {
      toast.success("Switched to flat view");
    } else {
      toast.success("Switched to spacetime view");
    }
  }, [mapViewState.isDistorted, updateMapViewState]);

  // Calculate isochrone when profile or time changes
  useEffect(() => {
    const calculateIsochrone = async () => {
      if (!currentProfile || !isMapLoaded) return;

      try {
        setLoading(true);

        const options: IsochroneOptions = {
          origin: mapViewState.center,
          travelMode: currentProfile.travelMode,
          maxTime: 15, // Default 15 minutes
          timeOfDay: new Date(
            new Date().setHours(selectedTimeSlice.start, 0, 0, 0)
          ),
          profile: currentProfile,
        };

        const isochrone = await googleMapsService.calculateIsochrone(options);
        setActiveIsochrone(isochrone);

        // Find POIs within the isochrone
        const pois = await googleMapsService.findPOIs(
          mapViewState.center,
          2000, // 2km radius
          ["CAFE", "RESTAURANT", "PARK", "BIKE_REPAIR", "GYM"]
        );
        setPOIs(pois);

        toast.success("Isochrone updated!");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to calculate isochrone";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    calculateIsochrone();
  }, [
    currentProfile,
    selectedTimeSlice,
    mapViewState.center,
    isMapLoaded,
    setActiveIsochrone,
    setPOIs,
    setLoading,
    setError,
  ]);

  useEffect(() => {
    if (autoPlayInterval) {
      window.clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
    return () => {
      if (autoPlayInterval) {
        window.clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);

  const handleToggleMode = () => {
    // Implement mode toggle logic
  };

  const handleToggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  const handleToggleTimeSlice = () => {
    setShowTimeSlice(!showTimeSlice);
  };

  const handleToggleSettings = () => {
    // Implement settings toggle logic
  };

  const onLoad = () => {
    // No need to set map here as it's already set up
  };

  const onUnmount = () => {
    // No need to set map here as it's already set up
  };

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <ErrorMessage
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LoadScript googleMapsApiKey={process.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{
              filter: mapViewState.isDistorted
                ? "hue-rotate(15deg) saturate(1.2)"
                : "none",
              transition: "filter 0.8s ease-in-out",
            }}
          />

          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <LoadingSpinner size="lg" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map Layers */}
          {isMapLoaded && mapInstanceRef.current && (
            <>
              {/* Isochrone Layer */}
              {activeIsochrone && (
                <IsochronePolygon
                  map={mapInstanceRef.current}
                  path={activeIsochrone.coordinates}
                  color={mapViewState.isDistorted ? "#a21caf" : "#2563eb"}
                  opacity={0.7}
                  distortion={
                    mapViewState.isDistorted
                      ? activeIsochrone.distortionFactor
                      : 0
                  }
                />
              )}

              {/* Heatmap Layer */}
              {showHeatmap && (
                <HeatmapLayer
                  map={mapInstanceRef.current}
                  data={[]} // Add your heatmap data here
                  opacity={0.6}
                />
              )}

              {/* POI Layer */}
              <POILayer map={mapInstanceRef.current} pois={pois} />

              {/* Route Overlay */}
              {routeInfo && (
                <RouteOverlay
                  map={mapInstanceRef.current}
                  route={routeInfo}
                  travelMode={currentProfile?.travelMode || "WALKING"}
                />
              )}

              {/* Destination Pin */}
              {destinationPin && (
                <DestinationPin
                  map={mapInstanceRef.current}
                  position={destinationPin}
                  routeInfo={routeInfo}
                />
              )}
            </>
          )}

          {/* Map Controls */}
          <MapControls
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onToggleMode={handleToggleMode}
            onToggleHeatmap={handleToggleHeatmap}
            onToggleTimeSlice={handleToggleTimeSlice}
            onToggleSettings={handleToggleSettings}
            showHeatmap={showHeatmap}
            showTimeSlice={showTimeSlice}
          />

          {/* View Mode Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  mapViewState.isDistorted ? "bg-purple-500" : "bg-blue-500"
                }`}
              />
              <span className="text-sm font-medium">
                {mapViewState.isDistorted ? "Spacetime View" : "Flat View"}
              </span>
            </div>
          </motion.div>

          {/* Instructions Overlay */}
          {!currentProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40"
            >
              <div className="bg-white rounded-xl p-6 max-w-md mx-4 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Welcome to Mappa!
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a profile to start exploring isochrones and discover
                  what's reachable around you.
                </p>
                <button
                  onClick={() => {
                    /* Open profile creation modal */
                  }}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create Profile
                </button>
              </div>
            </motion.div>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};
