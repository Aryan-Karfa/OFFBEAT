import { create } from "zustand";
import type {
  DiscoveryRequestDto,
  DiscoveryResultItemDto,
  DiscoveryContextDto,
  DiscoveryPaginationDto,
  RecommendationReasoningDto,
} from "@offbeat/shared";
import { discoveryService } from "../services/discoveryService";

interface DiscoveryResultsState {
  results: DiscoveryResultItemDto[];
  context: DiscoveryContextDto | null;
  pagination: DiscoveryPaginationDto | null;
  reasoning: RecommendationReasoningDto | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  fallback: boolean;
  notice: string | null;
  lastRequest: DiscoveryRequestDto | null;

  // Actions
  executeDiscovery: (request: DiscoveryRequestDto) => Promise<void>;
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

export const useDiscoveryResultsStore = create<DiscoveryResultsState>((set, get) => ({
  results: [],
  context: null,
  pagination: null,
  reasoning: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  fallback: false,
  notice: null,
  lastRequest: null,

  executeDiscovery: async (request: DiscoveryRequestDto) => {
    set({
      isLoading: true,
      error: null,
      lastRequest: request,
    });

    try {
      const response = await discoveryService.discover({
        ...request,
        page: 1,
      });

      set({
        results: response.results,
        context: response.context,
        pagination: response.pagination,
        reasoning: response.reasoning || null,
        fallback: Boolean(response.fallback),
        notice: response.notice || null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to discover places. Please try again.",
      });
    }
  },

  loadMore: async () => {
    const { pagination, lastRequest, results, isLoadingMore } = get();
    if (isLoadingMore || !pagination || !pagination.hasMore || !lastRequest) {
      return;
    }

    const nextPage = pagination.page + 1;
    set({ isLoadingMore: true });

    try {
      const response = await discoveryService.discover({
        ...lastRequest,
        page: nextPage,
      });

      // Deduplicate appended results by place ID
      const existingIds = new Set(results.map((r) => r.place.id));
      const newItems = response.results.filter((r) => !existingIds.has(r.place.id));

      set({
        results: [...results, ...newItems],
        pagination: response.pagination,
        isLoadingMore: false,
      });
    } catch (err) {
      set({
        isLoadingMore: false,
        error: err instanceof Error ? err.message : "Failed to load additional places.",
      });
    }
  },

  retry: async () => {
    const { lastRequest, executeDiscovery } = get();
    if (lastRequest) {
      await executeDiscovery(lastRequest);
    }
  },

  reset: () => {
    set({
      results: [],
      context: null,
      pagination: null,
      reasoning: null,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      fallback: false,
      notice: null,
      lastRequest: null,
    });
  },
}));
