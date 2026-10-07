import type { GeoLocation, EvidenceStrength, CrowdLevel } from "@offbeat/shared";

export interface ScheduledStop {
  placeId?: string;
  externalId?: string;
  name: string;
  slug?: string;
  destination?: string;
  category?: string;
  categories?: string[];
  imageUrl?: string | null;
  location?: GeoLocation;

  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;

  travelFromPreviousMinutes?: number;
  travelDistanceMeters?: number;

  timeFit: "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN";
  crowdFit: "GOOD" | "PARTIAL" | "UNKNOWN";

  confidence?: {
    score?: number;
    evidenceStrength?: EvidenceStrength;
    status?: string;
  };
  community?: {
    submissionCount: number;
    helpfulCount: number;
    verifiedCount: number;
    evidenceCount?: number;
  };

  why: string;
  isFreeTime?: boolean;
  isMustVisit?: boolean;
}

export interface ScheduledDay {
  day: number;
  title: string;
  date?: string;
  stops: ScheduledStop[];
  totalTravelMinutes: number;
  totalVisitMinutes: number;
  notes?: string[];
}

export interface CandidatePlaceWithSignals {
  id: string;
  name: string;
  slug?: string;
  destination?: string;
  destinationId?: string;
  regionId?: string;
  categories: string[];
  location?: GeoLocation;
  description?: string;
  imageUrl?: string | null;

  timeFit: "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN";
  crowdFit: "GOOD" | "PARTIAL" | "UNKNOWN";
  crowdLevel?: CrowdLevel;
  recommendedTime?: {
    start?: string;
    end?: string;
    reason?: string;
  };

  confidence?: {
    score?: number;
    evidenceStrength?: EvidenceStrength;
    status?: string;
  };
  community?: {
    submissionCount: number;
    helpfulCount: number;
    verifiedCount: number;
  };

  isMustVisit?: boolean;
  isAlternative?: boolean;
  score: number;
}
