import type {
  DiscoveryCandidate,
  NormalizedExternalPlace,
  PlaceWithDetails,
} from "./discovery.types.js";

export class CandidateMerger {
  /**
   * Normalizes a string for deterministic name and slug matching.
   */
  public static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }

  /**
   * Converts an internal PlaceWithDetails into a DiscoveryCandidate.
   */
  public static fromInternalPlace(place: PlaceWithDetails, regionName: string): DiscoveryCandidate {
    return {
      id: place.id,
      source: "INTERNAL",
      provider: "OFFBEAT",
      name: place.name,
      slug: place.slug,
      destination: place.destination.name,
      region: regionName,
      categories: place.categories.map((c) => c.category.name),
      location: {
        lat: place.latitude,
        lng: place.longitude,
      },
      address: place.address,
      description: place.description,
      imageUrl: place.imageUrl,
      rating: null,
      reviewCount: null,
      openingHours: null,
      sourceUrl: place.website,
    };
  }

  /**
   * Converts a normalized external SerpApi place into a DiscoveryCandidate.
   */
  public static fromExternalPlace(
    place: NormalizedExternalPlace,
    regionName: string,
    defaultDestination?: string,
  ): DiscoveryCandidate {
    const lat = place.latitude ?? 0;
    const lng = place.longitude ?? 0;

    return {
      id: place.placeId || place.externalId || `ext_${Math.random().toString(36).slice(2, 9)}`,
      source: "EXTERNAL",
      provider: "SERPAPI",
      name: place.name,
      slug: place.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      destination: defaultDestination || "Regional",
      region: regionName,
      categories: place.categories || [],
      location: { lat, lng },
      address: place.address,
      description: place.description,
      imageUrl: place.thumbnailUrl,
      rating: place.rating,
      reviewCount: place.reviewCount,
      openingHours: place.openingHours,
      sourceUrl: place.sourceUrl,
      rawMetadata: place.rawMetadata,
      externalReference: {
        provider: place.provider,
        externalId: place.externalId,
      },
    };
  }

  /**
   * Merges internal candidates and external candidates into a unified, deduplicated list.
   * Internal matches take canonical identity and are marked as COMBINED with external enrichment.
   */
  public static merge(
    internalPlaces: PlaceWithDetails[],
    externalPlaces: NormalizedExternalPlace[],
    context: { regionName: string; defaultDestination?: string },
  ): DiscoveryCandidate[] {
    const internalCandidates = internalPlaces.map((p) =>
      CandidateMerger.fromInternalPlace(p, context.regionName),
    );

    const mergedList: DiscoveryCandidate[] = [];
    const matchedInternalIds = new Set<string>();
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    // 1. Process internal candidates and check for external matches
    for (const internal of internalCandidates) {
      const normInternal = CandidateMerger.normalizeName(internal.name);

      // Attempt matching against external places
      const matchingExternal = externalPlaces.find((ext) => {
        const normExt = CandidateMerger.normalizeName(ext.name);
        const nameMatches =
          normExt === normInternal ||
          (normExt.length > 5 &&
            normInternal.length > 5 &&
            (normExt.includes(normInternal) || normInternal.includes(normExt)));
        const idMatches = ext.placeId && ext.placeId === internal.id;
        return nameMatches || idMatches;
      });

      if (matchingExternal) {
        matchedInternalIds.add(internal.id);

        // Create COMBINED candidate: canonical internal identity enriched with external data
        const combinedCategories = Array.from(
          new Set([...internal.categories, ...(matchingExternal.categories || [])]),
        );

        const combined: DiscoveryCandidate = {
          ...internal,
          source: "COMBINED",
          provider: "COMBINED",
          categories: combinedCategories,
          imageUrl: internal.imageUrl || matchingExternal.thumbnailUrl || null,
          rating: matchingExternal.rating || null,
          reviewCount: matchingExternal.reviewCount || null,
          openingHours: matchingExternal.openingHours || null,
          sourceUrl: internal.sourceUrl || matchingExternal.sourceUrl || null,
          externalReference: {
            provider: matchingExternal.provider,
            externalId: matchingExternal.externalId,
          },
        };

        mergedList.push(combined);
        seenNames.add(normInternal);
        seenIds.add(combined.id);
      } else {
        mergedList.push(internal);
        seenNames.add(normInternal);
        seenIds.add(internal.id);
      }
    }

    // 2. Add remaining external candidates that were not merged
    for (const ext of externalPlaces) {
      const normExt = CandidateMerger.normalizeName(ext.name);

      // Check if already represented
      const isAlreadyPresent = Array.from(seenNames).some(
        (existing) =>
          existing === normExt ||
          (existing.length > 6 &&
            normExt.length > 6 &&
            (existing.includes(normExt) || normExt.includes(existing))),
      );

      if (!isAlreadyPresent) {
        const extCandidate = CandidateMerger.fromExternalPlace(
          ext,
          context.regionName,
          context.defaultDestination,
        );

        if (!seenIds.has(extCandidate.id)) {
          mergedList.push(extCandidate);
          seenNames.add(normExt);
          seenIds.add(extCandidate.id);
        }
      }
    }

    return mergedList;
  }
}
