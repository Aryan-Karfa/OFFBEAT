import type {
  TimeObservationType,
  ObservationSource,
  DayType,
  TimeFit,
  OperatingWindowDto,
  OperatingHoursDto,
  RecommendedTimeDto,
  AvailableWindowDto,
  TimeTimingSignalDto,
  TimeIntelligenceDto,
  CreateTimeObservationRequestDto,
  EvidenceStrength,
  DayNightPreference,
} from "@offbeat/shared";

export type {
  TimeObservationType,
  ObservationSource,
  DayType,
  TimeFit,
  OperatingWindowDto,
  OperatingHoursDto,
  RecommendedTimeDto,
  AvailableWindowDto,
  TimeTimingSignalDto,
  TimeIntelligenceDto,
  CreateTimeObservationRequestDto,
  EvidenceStrength,
  DayNightPreference,
};

export interface TimeObservationRecord {
  id: string;
  placeId: string;
  userId?: string | null;
  type: TimeObservationType;
  startTime: string;
  endTime: string;
  dayType: DayType;
  observation?: string | null;
  source: ObservationSource;
  confidence?: number | null;
  createdAt: Date;
  expiresAt?: Date | null;
}

export type TimeEngineInput = TimeCalculationInputs;

export interface TimeCalculationInputs {
  placeId: string;
  placeName?: string;
  openingHours?: string[] | null;
  userDayNight?: DayNightPreference;
  preferredTime?: string | null;
  experienceTastes?: string[];
  observations?: TimeObservationRecord[];
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
