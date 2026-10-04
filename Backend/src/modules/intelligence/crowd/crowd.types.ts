import type {
  CrowdLevel,
  DayType,
  Season,
  ObservationSource,
  CrowdFit,
  CrowdPatternDto,
  CrowdIntelligenceDto,
  CreateCrowdObservationRequestDto,
  DiscoveryCrowdDto,
  EvidenceStrength,
} from "@offbeat/shared";

export type {
  CrowdLevel,
  DayType,
  Season,
  ObservationSource,
  CrowdFit,
  CrowdPatternDto,
  CrowdIntelligenceDto,
  CreateCrowdObservationRequestDto,
  DiscoveryCrowdDto,
  EvidenceStrength,
};

export interface CrowdObservationRecord {
  id: string;
  placeId?: string | null;
  destinationId?: string | null;
  userId?: string | null;
  level: CrowdLevel;
  timeStart?: string | null;
  timeEnd?: string | null;
  dayType: DayType;
  season: Season;
  observation?: string | null;
  source: ObservationSource;
  confidence?: number;
  createdAt: Date;
  expiresAt?: Date | null;
}

export type CrowdEngineInput = CrowdCalculationInputs;

export interface CrowdCalculationInputs {
  placeId?: string;
  placeName?: string;
  destinationId?: string;
  destinationName?: string;
  dayType?: DayType;
  timeWindow?: string;
  time?: string;
  season?: Season;
  placeObservations?: CrowdObservationRecord[];
  destinationObservations?: CrowdObservationRecord[];
  communitySubmissions?: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    status: string;
    supports?: Array<{ type: string }>;
    verifications?: Array<{ status: string }>;
  }>;
}
