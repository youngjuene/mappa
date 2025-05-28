export interface LatLng {
  lat: number;
  lng: number;
}

export interface IsochroneOptions {
  origin: LatLng;
  travelMode: TravelMode;
  maxTime: number; // in minutes
  timeOfDay?: Date;
  profile?: UserProfile;
}

export type TravelMode = "WALKING" | "BICYCLING" | "RUNNING";

export interface UserProfile {
  id: string;
  name: string;
  travelMode: TravelMode;
  averageSpeed: number; // km/h
  preferredPaths: PathPreference[];
  fitnessGoals: FitnessGoal[];
  lastUsed: Date;
}

export type PathPreference =
  | "BIKE_LANES"
  | "PEDESTRIAN_PLAZAS"
  | "PARKS"
  | "QUIET_STREETS"
  | "MAIN_ROADS";

export interface FitnessGoal {
  type: "DISTANCE" | "TIME" | "ELEVATION";
  target: number;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
}

export interface IsochronePolygon {
  coordinates: LatLng[];
  timeMinutes: number;
  travelMode: TravelMode;
  distortionFactor: number;
}

export interface RouteHeatmapData {
  segments: HeatmapSegment[];
  timeSlice: TimeSlice;
  intensity: number;
}

export interface HeatmapSegment {
  path: LatLng[];
  weight: number;
  travelMode: TravelMode;
  timestamp: Date;
}

export interface TimeSlice {
  start: number; // hour of day, 0-24
  end: number; // hour of day, 0-24
  label?: string;
}

export interface POI {
  id: string;
  position: LatLng;
  name: string;
  type: POIType;
  rating?: number;
  reachabilityScore: number;
  estimatedTime: number;
  distance: number;
  reviews?: POIReview[];
}

export type POIType =
  | "CAFE"
  | "RESTAURANT"
  | "PARK"
  | "BIKE_REPAIR"
  | "GYM"
  | "SHOP"
  | "TRANSIT";

export interface POIReview {
  rating: number;
  comment: string;
  author: string;
  date: Date;
}

export interface RouteInfo {
  path: LatLng[];
  distance: number;
  duration: number;
  elevationGain?: number;
  travelMode: TravelMode;
  instructions: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  position: LatLng;
}

export interface MapViewState {
  center: LatLng;
  zoom: number;
  isDistorted: boolean;
  showHeatmap: boolean;
  heatmapOpacity: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "SPEED" | "DISTANCE" | "FREQUENCY";
  target: number;
  timeframe: Date;
  participants: string[];
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  achievement: string;
  timestamp: Date;
}

export interface SocialShare {
  type: "ISOCHRONE_SNAPSHOT" | "ROUTE_ACHIEVEMENT" | "CHALLENGE";
  data: any;
  message: string;
  platform: "TWITTER" | "FACEBOOK" | "INSTAGRAM" | "LINKEDIN";
}

export interface AppState {
  currentProfile: UserProfile | null;
  mapViewState: MapViewState;
  activeIsochrone: IsochronePolygon | null;
  selectedTimeSlice: TimeSlice;
  heatmapData: RouteHeatmapData | null;
  pois: POI[];
  isLoading: boolean;
  error: string | null;
}

export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
  mapId?: string;
}
