import { create } from "zustand";

interface AppState {
  isInitialized: boolean;
  systemStatus: "idle" | "checking" | "connected" | "error";
  setSystemStatus: (status: "idle" | "checking" | "connected" | "error") => void;
  initialize: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  systemStatus: "idle",
  setSystemStatus: (status) => set({ systemStatus: status }),
  initialize: () => set({ isInitialized: true }),
}));
