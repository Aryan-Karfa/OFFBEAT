import type {
  MemoryType,
  MemorySource,
  MemoryConfidence,
  MemoryEventType,
  TravelerMemoryDto,
  MemoryEventDto,
  CreateMemoryEventDto,
  CategoryAffinityDto,
  DestinationAffinityDto,
  TravelerPersonalizationProfileDto,
  MemorySettingDto,
  UpdateMemorySettingDto,
  UpdateMemoryItemDto,
  GeminiSanitizedMemoryContext,
} from "@offbeat/shared";

export type {
  MemoryType,
  MemorySource,
  MemoryConfidence,
  MemoryEventType,
  TravelerMemoryDto,
  MemoryEventDto,
  CreateMemoryEventDto,
  CategoryAffinityDto,
  DestinationAffinityDto,
  TravelerPersonalizationProfileDto,
  MemorySettingDto,
  UpdateMemorySettingDto,
  UpdateMemoryItemDto,
  GeminiSanitizedMemoryContext,
};

/**
 * Standard deterministic weight deltas based on Phase 15 specification.
 */
export const MEMORY_WEIGHT_CONFIG: Record<MemoryEventType, {
  weightDelta: number;
  source: MemorySource;
  defaultType: MemoryType;
  initialConfidence: MemoryConfidence;
}> = {
  TASTE_SELECTED: {
    weightDelta: 1.0,
    source: "EXPLICIT",
    defaultType: "TASTE",
    initialConfidence: "HIGH",
  },
  EXPERIENCE_SELECTED: {
    weightDelta: 1.0,
    source: "EXPLICIT",
    defaultType: "EXPERIENCE",
    initialConfidence: "HIGH",
  },
  PLACE_VIEWED: {
    weightDelta: 0.2,
    source: "INTERACTION",
    defaultType: "PLACE_AFFINITY",
    initialConfidence: "LOW",
  },
  PLACE_EXPLORED: {
    weightDelta: 0.35,
    source: "INTERACTION",
    defaultType: "CATEGORY_AFFINITY",
    initialConfidence: "MODERATE",
  },
  ALTERNATIVE_SELECTED: {
    weightDelta: 0.7,
    source: "ALTERNATIVE",
    defaultType: "ALTERNATIVE_PREFERENCE",
    initialConfidence: "MODERATE",
  },
  ITINERARY_CREATED: {
    weightDelta: 0.6,
    source: "ITINERARY",
    defaultType: "PACE",
    initialConfidence: "MODERATE",
  },
  ITINERARY_STOP_KEPT: {
    weightDelta: 0.75,
    source: "ITINERARY",
    defaultType: "CATEGORY_AFFINITY",
    initialConfidence: "MODERATE",
  },
  ITINERARY_STOP_SWAPPED: {
    weightDelta: -0.5,
    source: "ITINERARY",
    defaultType: "CATEGORY_AFFINITY",
    initialConfidence: "LOW",
  },
  TAKE_HOME_VIEWED: {
    weightDelta: 0.2,
    source: "TAKE_HOME",
    defaultType: "TAKE_HOME_PREFERENCE",
    initialConfidence: "LOW",
  },
  TAKE_HOME_SELECTED: {
    weightDelta: 0.6,
    source: "TAKE_HOME",
    defaultType: "TAKE_HOME_PREFERENCE",
    initialConfidence: "MODERATE",
  },
  CATEGORY_SELECTED: {
    weightDelta: 0.5,
    source: "INTERACTION",
    defaultType: "CATEGORY_AFFINITY",
    initialConfidence: "MODERATE",
  },
};

/**
 * Sensitive category keywords that must NEVER be persisted into memory.
 */
export const SENSITIVE_MEMORY_PATTERNS = [
  /health/i,
  /medical/i,
  /illness/i,
  /disease/i,
  /politic/i,
  /election/i,
  /religion/i,
  /creed/i,
  /sexuality/i,
  /sexual/i,
  /finance/i,
  /salary/i,
  /income/i,
  /credit/i,
  /debt/i,
  /ethnicity/i,
  /race/i,
  /caste/i,
];

/**
 * In-memory representation for database records.
 */
export interface MemoryRecord {
  id: string;
  userId: string;
  type: MemoryType;
  key: string;
  value: string;
  source: MemorySource;
  confidence: MemoryConfidence;
  weight: number;
  evidenceCount: number;
  lastUsedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
  userVisible: boolean;
}

export interface MemoryEventRecord {
  id: string;
  userId: string;
  memoryId?: string | null;
  eventType: MemoryEventType;
  subjectType?: string | null;
  subjectId?: string | null;
  signalKey: string;
  signalValue: string;
  weightDelta: number;
  createdAt: Date;
}

export interface MemorySettingRecord {
  id: string;
  userId: string;
  memoryEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
