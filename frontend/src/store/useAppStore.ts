import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppState,
  UserProfile,
  IsochronePolygon,
  RouteHeatmapData,
  TimeSlice,
  POI,
  MapViewState,
  LatLng,
} from "@/types";

interface AppStore extends AppState {
  // Actions
  setCurrentProfile: (profile: UserProfile | null) => void;
  updateMapViewState: (viewState: Partial<MapViewState>) => void;
  setActiveIsochrone: (isochrone: IsochronePolygon | null) => void;
  setSelectedTimeSlice: (timeSlice: TimeSlice) => void;
  setHeatmapData: (data: RouteHeatmapData | null) => void;
  setPOIs: (pois: POI[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Profile management
  createProfile: (profile: Omit<UserProfile, "id" | "lastUsed">) => void;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => void;
  getProfiles: () => UserProfile[];

  // Map interactions
  toggleDistortion: () => void;
  toggleHeatmap: () => void;
  setHeatmapOpacity: (opacity: number) => void;

  // Time controls
  getTimeSlices: () => TimeSlice[];
  setTimeSlice: (slice: TimeSlice) => void;
}

const defaultTimeSlices: TimeSlice[] = [
  { start: 6, end: 9, label: "Morning Rush" },
  { start: 9, end: 12, label: "Mid Morning" },
  { start: 12, end: 14, label: "Lunch Time" },
  { start: 14, end: 17, label: "Afternoon" },
  { start: 17, end: 20, label: "Evening Rush" },
  { start: 20, end: 23, label: "Evening" },
];

const defaultMapCenter: LatLng = { lat: 37.7749, lng: -122.4194 }; // San Francisco

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProfile: null,
      mapViewState: {
        center: defaultMapCenter,
        zoom: 13,
        isDistorted: false,
        showHeatmap: true,
        heatmapOpacity: 0.7,
      },
      activeIsochrone: null,
      selectedTimeSlice: defaultTimeSlices[0],
      heatmapData: null,
      pois: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentProfile: (profile) => set({ currentProfile: profile }),

      updateMapViewState: (viewState) =>
        set((state) => ({
          mapViewState: { ...state.mapViewState, ...viewState },
        })),

      setActiveIsochrone: (isochrone) => set({ activeIsochrone: isochrone }),

      setSelectedTimeSlice: (timeSlice) =>
        set({ selectedTimeSlice: timeSlice }),

      setHeatmapData: (data) => set({ heatmapData: data }),

      setPOIs: (pois) => set({ pois }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      // Profile management
      createProfile: (profileData) => {
        const newProfile: UserProfile = {
          ...profileData,
          id: crypto.randomUUID(),
          lastUsed: new Date(),
        };

        // Store profiles in localStorage separately for persistence
        const existingProfiles = JSON.parse(
          localStorage.getItem("userProfiles") || "[]"
        );
        const updatedProfiles = [...existingProfiles, newProfile];
        localStorage.setItem("userProfiles", JSON.stringify(updatedProfiles));

        set({ currentProfile: newProfile });
      },

      updateProfile: (id, updates) => {
        const profiles = JSON.parse(
          localStorage.getItem("userProfiles") || "[]"
        );
        const updatedProfiles = profiles.map((profile: UserProfile) =>
          profile.id === id
            ? { ...profile, ...updates, lastUsed: new Date() }
            : profile
        );
        localStorage.setItem("userProfiles", JSON.stringify(updatedProfiles));

        const state = get();
        if (state.currentProfile?.id === id) {
          set({
            currentProfile: {
              ...state.currentProfile,
              ...updates,
              lastUsed: new Date(),
            },
          });
        }
      },

      deleteProfile: (id) => {
        const profiles = JSON.parse(
          localStorage.getItem("userProfiles") || "[]"
        );
        const updatedProfiles = profiles.filter(
          (profile: UserProfile) => profile.id !== id
        );
        localStorage.setItem("userProfiles", JSON.stringify(updatedProfiles));

        const state = get();
        if (state.currentProfile?.id === id) {
          set({ currentProfile: null });
        }
      },

      getProfiles: () => {
        return JSON.parse(localStorage.getItem("userProfiles") || "[]");
      },

      // Map interactions
      toggleDistortion: () =>
        set((state) => ({
          mapViewState: {
            ...state.mapViewState,
            isDistorted: !state.mapViewState.isDistorted,
          },
        })),

      toggleHeatmap: () =>
        set((state) => ({
          mapViewState: {
            ...state.mapViewState,
            showHeatmap: !state.mapViewState.showHeatmap,
          },
        })),

      setHeatmapOpacity: (opacity) =>
        set((state) => ({
          mapViewState: {
            ...state.mapViewState,
            heatmapOpacity: opacity,
          },
        })),

      // Time controls
      getTimeSlices: () => defaultTimeSlices,

      setTimeSlice: (slice) => set({ selectedTimeSlice: slice }),
    }),
    {
      name: "mappa-app-store",
      partialize: (state) => ({
        currentProfile: state.currentProfile,
        mapViewState: state.mapViewState,
        selectedTimeSlice: state.selectedTimeSlice,
      }),
    }
  )
);
