import { create } from "zustand";
import type {
  TakeHomeItemDto,
  TakeHomeCategory,
  TakeHomeGoodFor,
  TakeHomeBudget,
  TakeHomeReasoningDto,
} from "@offbeat/shared";
import { takeHomeService } from "../services/takeHomeService";

export interface TakeHomeState {
  destinationId: string;
  placeId: string | null;
  destinationInfo: {
    id: string;
    name: string;
    regionId?: string;
  } | null;
  items: TakeHomeItemDto[];
  selectedItem: TakeHomeItemDto | null;
  reasoning: TakeHomeReasoningDto | null;
  category: TakeHomeCategory | "ALL";
  giftFor: TakeHomeGoodFor | null;
  budget: TakeHomeBudget | null;
  verifiedOnly: boolean;
  loading: boolean;
  error: string | null;
  fallback: boolean;
  isWhereToFindOpen: boolean;
  isAlternativesOpen: boolean;

  // Actions
  fetchTakeHome: (
    destinationId: string,
    options?: { category?: TakeHomeCategory | "ALL"; giftFor?: TakeHomeGoodFor | null },
  ) => Promise<void>;
  fetchTakeHomeForPlace: (placeId: string) => Promise<void>;
  setCategory: (category: TakeHomeCategory | "ALL") => void;
  setGiftFor: (giftFor: TakeHomeGoodFor | null) => void;
  setVerifiedOnly: (verifiedOnly: boolean) => void;
  selectItem: (item: TakeHomeItemDto | null) => void;
  openWhereToFind: (item: TakeHomeItemDto) => void;
  closeWhereToFind: () => void;
  openAlternatives: (item: TakeHomeItemDto) => void;
  closeAlternatives: () => void;
  reset: () => void;
}

export const useTakeHomeStore = create<TakeHomeState>((set, get) => ({
  destinationId: "dest_darjeeling",
  placeId: null,
  destinationInfo: null,
  items: [],
  selectedItem: null,
  reasoning: null,
  category: "ALL",
  giftFor: null,
  budget: null,
  verifiedOnly: false,
  loading: false,
  error: null,
  fallback: false,
  isWhereToFindOpen: false,
  isAlternativesOpen: false,

  fetchTakeHome: async (destinationId: string, options) => {
    const currentCategory = options?.category !== undefined ? options.category : get().category;
    const currentGiftFor = options?.giftFor !== undefined ? options.giftFor : get().giftFor;

    set({ loading: true, error: null, destinationId });
    try {
      const response = await takeHomeService.getTakeHomeByDestination(destinationId, {
        category: currentCategory === "ALL" ? undefined : currentCategory,
        giftFor: currentGiftFor || undefined,
        verifiedOnly: get().verifiedOnly,
      });

      set({
        destinationInfo: response.destination,
        items: response.items,
        selectedItem: response.items[0] || null,
        reasoning: response.reasoning || null,
        fallback: response.fallback,
        loading: false,
      });
    } catch (err) {
      set({
        error: (err as Error).message || "Failed to load Take Home recommendations",
        loading: false,
      });
    }
  },

  fetchTakeHomeForPlace: async (placeId: string) => {
    set({ loading: true, error: null, placeId });
    try {
      const currentCat = get().category;
      const response = await takeHomeService.getTakeHomeByPlace(placeId, {
        category: currentCat === "ALL" ? undefined : (currentCat as TakeHomeCategory),
        giftFor: get().giftFor || undefined,
        verifiedOnly: get().verifiedOnly,
      });

      set({
        destinationId: response.destination.id,
        destinationInfo: response.destination,
        items: response.items,
        selectedItem: response.items[0] || null,
        reasoning: response.reasoning || null,
        fallback: response.fallback,
        loading: false,
      });
    } catch (err) {
      set({
        error: (err as Error).message || "Failed to load Take Home recommendations for place",
        loading: false,
      });
    }
  },

  setCategory: (category) => {
    set({ category });
    const { destinationId } = get();
    if (destinationId) {
      get().fetchTakeHome(destinationId, { category });
    }
  },

  setGiftFor: (giftFor) => {
    set({ giftFor });
    const { destinationId } = get();
    if (destinationId) {
      get().fetchTakeHome(destinationId, { giftFor });
    }
  },

  setVerifiedOnly: (verifiedOnly) => {
    set({ verifiedOnly });
    const { destinationId } = get();
    if (destinationId) {
      get().fetchTakeHome(destinationId);
    }
  },

  selectItem: (item) => set({ selectedItem: item }),

  openWhereToFind: (item) => set({ selectedItem: item, isWhereToFindOpen: true }),
  closeWhereToFind: () => set({ isWhereToFindOpen: false }),

  openAlternatives: (item) => set({ selectedItem: item, isAlternativesOpen: true }),
  closeAlternatives: () => set({ isAlternativesOpen: false }),

  reset: () =>
    set({
      destinationId: "dest_darjeeling",
      placeId: null,
      destinationInfo: null,
      items: [],
      selectedItem: null,
      reasoning: null,
      category: "ALL",
      giftFor: null,
      budget: null,
      verifiedOnly: false,
      loading: false,
      error: null,
      fallback: false,
      isWhereToFindOpen: false,
      isAlternativesOpen: false,
    }),
}));
