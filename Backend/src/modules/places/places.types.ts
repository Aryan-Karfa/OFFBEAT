/**
 * Places Domain Types and Internal Contracts
 */

export type { PlaceDetailDto, PlaceCategoryDto, PlaceStatus, GeoLocation } from "@offbeat/shared";

import type { Place, Destination, PlaceCategory, PlaceCategoryRelation } from "@prisma/client";

export type PlaceWithDetails = Place & {
  destination: Destination;
  categories: (PlaceCategoryRelation & {
    category: PlaceCategory;
  })[];
};
