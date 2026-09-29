/**
 * Geography Domain Types and Internal Contracts
 */

export type {
  CountryDto,
  CountryWithRegionsDto,
  RegionSummaryDto,
  RegionDetailDto,
  DestinationSummaryDto,
  RegionType,
  DestinationStatus,
  GeoLocation,
} from "@offbeat/shared";

import type { Country, Region, Destination } from "@prisma/client";

export type CountryWithRegions = Country & {
  regions: Region[];
};

export type RegionWithDestinations = Region & {
  destinations: Destination[];
};
