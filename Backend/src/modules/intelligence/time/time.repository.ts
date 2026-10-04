import { prisma, isDatabaseConnected } from "../../../lib/db/prisma.js";
import type { TimeObservationRecord } from "./time.types.js";
import type { CreateTimeObservationInput } from "./time.schema.js";

export class TimeRepository {
  private inMemoryObservations: TimeObservationRecord[] = [
    {
      id: "time_tiger_hill_sunrise",
      placeId: "place_tiger_hill",
      userId: "user_demo_traveler",
      type: "SUNRISE_TIME",
      startTime: "04:30",
      endTime: "05:30",
      dayType: "ANY",
      observation:
        "Arrive 30 minutes before first light to secure an unobstructed eastern view of Kanchenjunga",
      source: "COMMUNITY",
      confidence: 0.88,
      createdAt: new Date("2026-09-25T05:00:00Z"),
      expiresAt: null,
    },
    {
      id: "time_tiger_hill_opening",
      placeId: "place_tiger_hill",
      userId: null,
      type: "OPENING_TIME",
      startTime: "04:00",
      endTime: "18:00",
      dayType: "ANY",
      observation: "Observatory pavilion grounds open early for sunrise visitors",
      source: "EXTERNAL",
      confidence: 0.95,
      createdAt: new Date("2026-09-20T00:00:00Z"),
      expiresAt: null,
    },
    {
      id: "time_batasia_loop_morning",
      placeId: "place_batasia_loop",
      userId: "user_demo_traveler",
      type: "BEST_TIME",
      startTime: "06:30",
      endTime: "08:30",
      dayType: "ANY",
      observation:
        "Clear mountain panorama before cloud cover builds up and ahead of toy train crowds",
      source: "COMMUNITY",
      confidence: 0.82,
      createdAt: new Date("2026-09-26T06:30:00Z"),
      expiresAt: null,
    },
    {
      id: "time_vm_sunset",
      placeId: "place_victoria_memorial",
      userId: "user_demo_supporter",
      type: "SUNSET_TIME",
      startTime: "16:30",
      endTime: "17:45",
      dayType: "ANY",
      observation: "Golden hour reflections across the North Pond garden grounds",
      source: "COMMUNITY",
      confidence: 0.8,
      createdAt: new Date("2026-09-27T16:30:00Z"),
      expiresAt: null,
    },
    {
      id: "time_vm_opening",
      placeId: "place_victoria_memorial",
      userId: null,
      type: "OPENING_TIME",
      startTime: "10:00",
      endTime: "18:00",
      dayType: "ANY",
      observation: "Museum gallery and garden accessibility window",
      source: "EXTERNAL",
      confidence: 0.95,
      createdAt: new Date("2026-09-20T00:00:00Z"),
      expiresAt: null,
    },
  ];

  async findObservationsByPlaceId(
    placeId: string,
    includeExpired = false,
  ): Promise<TimeObservationRecord[]> {
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const whereClause: Record<string, unknown> = { placeId };
        if (!includeExpired) {
          whereClause.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
        }

        const records = await prisma.timeObservation.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
        });

        if (records.length > 0) {
          return records.map((r) => ({
            id: r.id,
            placeId: r.placeId,
            userId: r.userId,
            type: r.type,
            startTime: r.startTime,
            endTime: r.endTime,
            dayType: r.dayType,
            observation: r.observation,
            source: r.source,
            confidence: r.confidence,
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

  async createObservation(
    placeId: string,
    input: CreateTimeObservationInput,
    userId?: string | null,
    source: "COMMUNITY" | "EXTERNAL" | "SYSTEM" = "COMMUNITY",
  ): Promise<TimeObservationRecord> {
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    if (isDatabaseConnected()) {
      try {
        const created = await prisma.timeObservation.create({
          data: {
            placeId,
            userId: userId || null,
            type: input.type,
            startTime: input.startTime,
            endTime: input.endTime,
            dayType: input.dayType || "ANY",
            observation: input.observation || null,
            source,
            confidence: 0.8,
            expiresAt,
          },
        });

        return {
          id: created.id,
          placeId: created.placeId,
          userId: created.userId,
          type: created.type,
          startTime: created.startTime,
          endTime: created.endTime,
          dayType: created.dayType,
          observation: created.observation,
          source: created.source,
          confidence: created.confidence,
          createdAt: created.createdAt,
          expiresAt: created.expiresAt,
        };
      } catch {
        // Fall back to in-memory store
      }
    }

    const newRecord: TimeObservationRecord = {
      id: `time_obs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      placeId,
      userId: userId || null,
      type: input.type,
      startTime: input.startTime,
      endTime: input.endTime,
      dayType: input.dayType || "ANY",
      observation: input.observation || null,
      source,
      confidence: 0.8,
      createdAt: new Date(),
      expiresAt,
    };

    this.inMemoryObservations.unshift(newRecord);
    return newRecord;
  }
}

export const timeRepository = new TimeRepository();
