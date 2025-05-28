import { Loader } from "@googlemaps/js-api-loader";
import type {
  LatLng,
  IsochroneOptions,
  IsochronePolygon,
  RouteInfo,
  TravelMode,
  POI,
  POIType,
} from "@/types";

// Add type declaration for ImportMeta
declare global {
  interface ImportMeta {
    env: {
      VITE_GOOGLE_MAPS_API_KEY: string;
    };
  }
}

let googleMapsLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (googleMapsLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("Google Maps API key not found in environment variables");
    return Promise.reject(new Error("Google Maps API key not found"));
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,visualization`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn(
    "Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables."
  );
}

export class GoogleMapsService {
  private loader: Loader;
  private map: google.maps.Map | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private distanceMatrixService: google.maps.DistanceMatrixService | null =
    null;

  constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places", "geometry", "visualization"],
    });
  }

  async initialize(
    mapElement: HTMLElement,
    center: LatLng
  ): Promise<google.maps.Map> {
    try {
      await this.loader.load();

      this.map = new google.maps.Map(mapElement, {
        center,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        gestureHandling: "greedy",
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: true,
      });

      this.directionsService = new google.maps.DirectionsService();
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.distanceMatrixService = new google.maps.DistanceMatrixService();

      return this.map;
    } catch (error) {
      console.error("Failed to initialize Google Maps:", error);
      throw new Error(
        "Google Maps initialization failed. Please check your API key and network connection."
      );
    }
  }

  private validateApiKey(): void {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key is required");
    }
  }

  private convertTravelMode(mode: TravelMode): google.maps.TravelMode {
    switch (mode) {
      case "WALKING":
        return google.maps.TravelMode.WALKING;
      case "BICYCLING":
        return google.maps.TravelMode.BICYCLING;
      case "RUNNING":
        return google.maps.TravelMode.WALKING; // Google Maps doesn't have running mode
      default:
        return google.maps.TravelMode.WALKING;
    }
  }

  async calculateIsochrone(
    options: IsochroneOptions
  ): Promise<IsochronePolygon> {
    this.validateApiKey();

    if (!this.directionsService || !this.distanceMatrixService) {
      throw new Error("Google Maps services not initialized");
    }

    try {
      // Generate points in a grid around the origin
      const gridPoints = this.generateGridPoints(
        options.origin,
        options.maxTime
      );
      const reachablePoints: LatLng[] = [];

      // Calculate travel times to each point
      const chunks = this.chunkArray(gridPoints, 25); // Google Maps API limit

      for (const chunk of chunks) {
        const result = await this.calculateDistanceMatrix(
          options.origin,
          chunk,
          options.travelMode
        );

        chunk.forEach((point, index) => {
          const element = result.rows[0]?.elements[index];
          if (element?.status === "OK" && element.duration) {
            const travelTimeMinutes = element.duration.value / 60;
            if (travelTimeMinutes <= options.maxTime) {
              reachablePoints.push(point);
            }
          }
        });
      }

      // Create convex hull for isochrone boundary
      const boundary = this.createConvexHull(reachablePoints);

      return {
        coordinates: boundary,
        timeMinutes: options.maxTime,
        travelMode: options.travelMode,
        distortionFactor: this.calculateDistortionFactor(options.travelMode),
      };
    } catch (error) {
      console.error("Error calculating isochrone:", error);
      throw new Error("Failed to calculate isochrone. Please try again.");
    }
  }

  private generateGridPoints(center: LatLng, maxTimeMinutes: number): LatLng[] {
    const points: LatLng[] = [];
    const estimatedRadius = this.estimateRadius(maxTimeMinutes);
    const gridSize = 20; // Number of points per side
    const step = (estimatedRadius * 2) / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = center.lat + ((i - gridSize / 2) * step) / 111000; // Rough conversion to degrees
        const lng =
          center.lng +
          ((j - gridSize / 2) * step) /
            (111000 * Math.cos((center.lat * Math.PI) / 180));
        points.push({ lat, lng });
      }
    }

    return points;
  }

  private estimateRadius(maxTimeMinutes: number): number {
    // Rough estimation: walking speed ~5 km/h, cycling ~15 km/h
    const walkingSpeed = 5000; // meters per hour
    return (maxTimeMinutes / 60) * walkingSpeed;
  }

  private async calculateDistanceMatrix(
    origin: LatLng,
    destinations: LatLng[],
    travelMode: TravelMode
  ): Promise<google.maps.DistanceMatrixResponse> {
    return new Promise((resolve, reject) => {
      if (!this.distanceMatrixService) {
        reject(new Error("Distance Matrix service not initialized"));
        return;
      }

      this.distanceMatrixService.getDistanceMatrix(
        {
          origins: [origin],
          destinations,
          travelMode: this.convertTravelMode(travelMode),
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: travelMode === "WALKING" || travelMode === "RUNNING",
          avoidTolls: true,
        },
        (result, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Distance Matrix request failed: ${status}`));
          }
        }
      );
    });
  }

  private createConvexHull(points: LatLng[]): LatLng[] {
    if (points.length < 3) return points;

    // Simple convex hull algorithm (Graham scan)
    const sortedPoints = points.sort((a, b) => a.lat - b.lat || a.lng - b.lng);

    const cross = (o: LatLng, a: LatLng, b: LatLng): number => {
      return (
        (a.lat - o.lat) * (b.lng - o.lng) - (a.lng - o.lng) * (b.lat - o.lat)
      );
    };

    const lower: LatLng[] = [];
    for (const point of sortedPoints) {
      while (
        lower.length >= 2 &&
        cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
      ) {
        lower.pop();
      }
      lower.push(point);
    }

    const upper: LatLng[] = [];
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      const point = sortedPoints[i];
      while (
        upper.length >= 2 &&
        cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
      ) {
        upper.pop();
      }
      upper.push(point);
    }

    return [...lower.slice(0, -1), ...upper.slice(0, -1)];
  }

  private calculateDistortionFactor(travelMode: TravelMode): number {
    switch (travelMode) {
      case "WALKING":
        return 1.2;
      case "BICYCLING":
        return 0.8;
      case "RUNNING":
        return 1.0;
      default:
        return 1.0;
    }
  }

  async calculateRoute(
    origin: LatLng,
    destination: LatLng,
    travelMode: TravelMode
  ): Promise<RouteInfo> {
    this.validateApiKey();

    if (!this.directionsService) {
      throw new Error("Directions service not initialized");
    }

    return new Promise((resolve, reject) => {
      this.directionsService!.route(
        {
          origin,
          destination,
          travelMode: this.convertTravelMode(travelMode),
          optimizeWaypoints: true,
          avoidHighways: travelMode === "WALKING" || travelMode === "RUNNING",
          avoidTolls: true,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const route = result.routes[0];
            const leg = route.legs[0];

            resolve({
              path: route.overview_path.map((point) => ({
                lat: point.lat(),
                lng: point.lng(),
              })),
              distance: leg.distance?.value || 0,
              duration: leg.duration?.value || 0,
              travelMode,
              instructions: leg.steps.map((step) => ({
                instruction: step.instructions,
                distance: step.distance?.value || 0,
                duration: step.duration?.value || 0,
                position: {
                  lat: step.start_location.lat(),
                  lng: step.start_location.lng(),
                },
              })),
            });
          } else {
            reject(new Error(`Route calculation failed: ${status}`));
          }
        }
      );
    });
  }

  async findPOIs(
    center: LatLng,
    radius: number,
    types: POIType[]
  ): Promise<POI[]> {
    this.validateApiKey();

    if (!this.placesService) {
      throw new Error("Places service not initialized");
    }

    const googleTypes = this.convertPOITypes(types);
    const pois: POI[] = [];

    for (const type of googleTypes) {
      try {
        const results = await this.searchPlaces(center, radius, type);
        pois.push(...results);
      } catch (error) {
        console.warn(`Failed to search for ${type}:`, error);
      }
    }

    return pois;
  }

  private convertPOITypes(types: POIType[]): string[] {
    const typeMap: Record<POIType, string> = {
      CAFE: "cafe",
      RESTAURANT: "restaurant",
      PARK: "park",
      BIKE_REPAIR: "bicycle_store",
      GYM: "gym",
      SHOP: "store",
      TRANSIT: "transit_station",
    };

    return types.map((type) => typeMap[type]).filter(Boolean);
  }

  private async searchPlaces(
    center: LatLng,
    radius: number,
    type: string
  ): Promise<POI[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error("Places service not initialized"));
        return;
      }

      this.placesService.nearbySearch(
        {
          location: center,
          radius,
          type,
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const pois = results.map((place) => ({
              id: place.place_id || crypto.randomUUID(),
              position: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              name: place.name || "Unknown",
              type: this.convertGoogleTypeToInternal(type),
              rating: place.rating,
              reachabilityScore: this.calculateReachabilityScore(center, {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              }),
              estimatedTime: 0, // Will be calculated separately
              distance: 0, // Will be calculated separately
            }));
            resolve(pois);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        }
      );
    });
  }

  private convertGoogleTypeToInternal(googleType: string): POIType {
    const typeMap: Record<string, POIType> = {
      cafe: "CAFE",
      restaurant: "RESTAURANT",
      park: "PARK",
      bicycle_store: "BIKE_REPAIR",
      gym: "GYM",
      store: "SHOP",
      transit_station: "TRANSIT",
    };

    return typeMap[googleType] || "SHOP";
  }

  private calculateReachabilityScore(
    origin: LatLng,
    destination: LatLng
  ): number {
    const distance = this.calculateDistance(origin, destination);
    // Simple scoring: closer = higher score
    return Math.max(0, 100 - (distance / 1000) * 10);
  }

  private calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  getMap(): google.maps.Map | null {
    return this.map;
  }
}

export const googleMapsService = new GoogleMapsService();
