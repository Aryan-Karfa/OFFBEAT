import { prisma, isDatabaseConnected } from "../../../lib/db/prisma.js";
import type { CrowdObservationRecord } from "./crowd.types.js";
import type { CreateCrowdObservationInput } from "./crowd.schema.js";

export class CrowdRepository {
  private inMemoryObservations: CrowdObservationRecord[] = [
    {
      id: "crowd_tiger_hill_weekday",
      placeId: "place_tiger_hill",
      destinationId: "dest_darjeeling",
      userId: "user_demo_traveler",
      level: "LOW",
      timeStart: "04:30",
      timeEnd: "06:30",
      dayType: "WEEKDAY",
      season: "ANY",
      observation: "Lower crowd and quieter atmosphere on weekday early mornings",
      source: "COMMUNITY",
      createdAt: new Date("2026-09-25T05:00:00Z"),
      expiresAt: null,
    },
    {
      id: "crowd_tiger_hill_weekend",
      placeId: "place_tiger_hill",
      destinationId: "dest_darjeeling",
      userId: "user_demo_local",
      level: "HIGH",
      timeStart: "08:00",
      timeEnd: "10:00",
      dayType: "WEEKEND",
      season: "ANY",
      observation: "Weekends see heavy shared-jeep congestion from Ghum after 8 AM",
      source: "COMMUNITY",
      createdAt: new Date("2026-09-26T08:00:00Z"),
      expiresAt: null,
    },
    {
      id: "crowd_dest_darjeeling_weekend",
      placeId: null,
      destinationId: "dest_darjeeling",
      userId: null,
      level: "MODERATE",
      timeStart: null,
      timeEnd: null,
      dayType: "WEEKEND",
      season: "ANY",
      observation: "Town center and hill routes experience steady visitor flow on weekends",
      source: "COMMUNITY",
      createdAt: new Date("2026-09-20T00:00:00Z"),
      expiresAt: null,
    },
    {
      id: "crowd_batasia_morning",
      placeId: "place_batasia_loop",
      destinationId: "dest_darjeeling",
      userId: "user_demo_traveler",
      level: "LOW",
      timeStart: "06:30",
      timeEnd: "08:00",
      dayType: "WEEKDAY",
      season: "ANY",
      observation: "Quiet memorial gardens before tourist buses arrive",
      source: "COMMUNITY",
      createdAt: new Date("2026-09-26T06:30:00Z"),
      expiresAt: null,
    },
    {
      id: "crowd_vm_weekday",
      placeId: "place_victoria_memorial",
      destinationId: "dest_kolkata",
      userId: "user_demo_supporter",
      level: "MODERATE",
      timeStart: "16:30",
      timeEnd: "17:45",
      dayType: "WEEKDAY",
      season: "ANY",
      observation: "Gardens are peaceful around sunset while museum hall queues subside",
      source: "COMMUNITY",
      createdAt: new Date("2026-09-27T16:30:00Z"),
      expiresAt: null,
    },
    {
      id: "crowd_vm_weekend",
      placeId: "place_victoria_memorial",
      destinationId: "dest_kolkata",
      userId: "user_demo_local",
      level: "VERY_HIGH",
      timeStart: "14:00",
      timeEnd: "17:00",
      dayType: "WEEKEND",
      season: "ANY",
      observation: "Lengthy admission queues at the southern entrance on weekend afternoons",
      source: "COMMUNITY",
      createdAt: new Date("2026-09-27T14:00:00Z"),
      expiresAt: null,
    },
  ];

  async findObservationsByPlaceId(
    placeId: string,
    includeExpired = false,
  ): Promise<CrowdObservationRecord[]> {
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const whereClause: Record<string, unknown> = { placeId };
        if (!includeExpired) {
          whereClause.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
        }

        const records = await prisma.crowdObservation.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
        });

        if (records.length > 0) {
          return records.map((r) => ({
            id: r.id,
            placeId: r.placeId,
            destinationId: r.destinationId,
            userId: r.userId,
            level: r.level,
            timeStart: r.timeStart,
            timeEnd: r.timeEnd,
            dayType: r.dayType,
            season: r.season,
            observation: r.observation,
            source: r.source,
            createdAt: r.createdAt,
            expiresAt: r.expiresAt,
          }));
        }
      } catch {
        // Fall back to in-memory store
      }
    }

    return this.inMemoryObservations.filter((obs) => {
      if (obs.placeId !== placeId) return false;
      if (!includeExpired && obs.expiresAt && obs.expiresAt <= now) return false;
      return true;
    });
  }

  async findObservationsByDestinationId(
    destinationId: string,
    includeExpired = false,
  ): Promise<CrowdObservationRecord[]> {
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const whereClause: Record<string, unknown> = { destinationId };
        if (!includeExpired) {
          whereClause.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
        }

        const records = await prisma.crowdObservation.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
        });

        if (records.length > 0) {
          return records.map((r) => ({
            id: r.id,
            placeId: r.placeId,
            destinationId: r.destinationId,
            userId: r.userId,
            level: r.level,
            timeStart: r.timeStart,
            timeEnd: r.timeEnd,
            dayType: r.dayType,
            season: r.season,
            observation: r.observation,
            source: r.source,
            createdAt: r.createdAt,
            expiresAt: r.expiresAt,
          }));
        }
      } catch {
        // Fall back to in-memory store
      }
    }

    return this.inMemoryObservations.filter((obs) => {
      if (obs.destinationId !== destinationId) return false;
      if (!includeExpired && obs.expiresAt && obs.expiresAt <= now) return false;
      return true;
    });
  }

  async createObservation(
    data: CreateCrowdObservationInput,
    userId?: string | null,
    placeId?: string | null,
    source: "COMMUNITY" | "EXTERNAL" | "SYSTEM" = "COMMUNITY",
  ): Promise<CrowdObservationRecord> {
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    if (isDatabaseConnected()) {
      try {
        const created = await prisma.crowdObservation.create({
          data: {
            placeId: placeId || null,
            destinationId: data.destinationId || null,
            userId: userId || null,
            level: data.level,
            timeStart: data.timeStart || null,
            timeEnd: data.timeEnd || null,
            dayType: data.dayType || "ANY",
            season: data.season || "ANY",
            observation: data.observation || null,
            source,
            expiresAt,
          },
        });

        return {
          id: created.id,
          placeId: created.placeId,
          destinationId: created.destinationId,
          userId: created.userId,
          level: created.level,
          timeStart: created.timeStart,
          timeEnd: created.timeEnd,
          dayType: created.dayType,
          season: created.season,
          observation: created.observation,
          source: created.source,
          createdAt: created.createdAt,
          expiresAt: created.expiresAt,
        };
      } catch {
        // Fall back to in-memory store
      }
    }

    const newRecord: CrowdObservationRecord = {
      id: `crowd_obs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      placeId: placeId || null,
      destinationId: data.destinationId || null,
      userId: userId || null,
      level: data.level,
      timeStart: data.timeStart || null,
      timeEnd: data.timeEnd || null,
      dayType: data.dayType || "ANY",
      season: data.season || "ANY",
      observation: data.observation || null,
      source,
      createdAt: new Date(),
      expiresAt,
    };

    this.inMemoryObservations.unshift(newRecord);
    return newRecord;
  }
}

export const crowdRepository = new CrowdRepository();
