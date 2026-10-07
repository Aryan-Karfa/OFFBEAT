import type { TravelerMemory as PrismaTravelerMemory } from "@prisma/client";
import { prisma, isDatabaseConnected } from "../../lib/db/prisma.js";
import { DEMO_USER_TRAVELER } from "../community/community.repository.js";
import {
  type MemoryType,
  type MemorySource,
  type MemoryConfidence,
  type MemoryEventType,
  type MemoryRecord,
  type MemoryEventRecord,
  type MemorySettingRecord,
} from "./memory.types.js";

/**
 * Initial demo traveler memories for hackathon presentation and testing.
 */
function createDemoMemories(userId: string): MemoryRecord[] {
  const now = new Date();
  return [
    {
      id: "mem_demo_mountains",
      userId,
      type: "TASTE",
      key: "mountains",
      value: "Mountains",
      source: "EXPLICIT",
      confidence: "HIGH",
      weight: 1.0,
      evidenceCount: 5,
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    },
    {
      id: "mem_demo_photography",
      userId,
      type: "TASTE",
      key: "photography",
      value: "Photography",
      source: "EXPLICIT",
      confidence: "HIGH",
      weight: 0.95,
      evidenceCount: 4,
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    },
    {
      id: "mem_demo_sunrise",
      userId,
      type: "EXPERIENCE",
      key: "sunrise",
      value: "Sunrise",
      source: "EXPLICIT",
      confidence: "HIGH",
      weight: 0.95,
      evidenceCount: 4,
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    },
    {
      id: "mem_demo_pace",
      userId,
      type: "PACE",
      key: "pace_preference",
      value: "BALANCED",
      source: "ITINERARY",
      confidence: "MODERATE",
      weight: 0.85,
      evidenceCount: 3,
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    },
    {
      id: "mem_demo_alt_crowd",
      userId,
      type: "ALTERNATIVE_PREFERENCE",
      key: "alternative_mode",
      value: "LOWER_CROWD",
      source: "ALTERNATIVE",
      confidence: "MODERATE",
      weight: 0.8,
      evidenceCount: 3,
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    },
    {
      id: "mem_demo_cat_scenic",
      userId,
      type: "CATEGORY_AFFINITY",
      key: "scenic_viewpoint",
      value: "Scenic Viewpoint",
      source: "INTERACTION",
      confidence: "MODERATE",
      weight: 0.75,
      evidenceCount: 3,
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    },
    {
      id: "mem_demo_take_home_tea",
      userId,
      type: "TAKE_HOME_PREFERENCE",
      key: "tea_coffee",
      value: "TEA_COFFEE",
      source: "TAKE_HOME",
      confidence: "MODERATE",
      weight: 0.75,
      evidenceCount: 2,
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    },
  ];
}

export class MemoryRepository {
  private inMemoryRecords: Map<string, MemoryRecord[]> = new Map();
  private inMemoryEvents: MemoryEventRecord[] = [];
  private inMemorySettings: Map<string, MemorySettingRecord> = new Map();

  constructor() {
    // Seed default memories for the primary demo traveler
    this.inMemoryRecords.set(DEMO_USER_TRAVELER.id, createDemoMemories(DEMO_USER_TRAVELER.id));
    this.inMemorySettings.set(DEMO_USER_TRAVELER.id, {
      id: "setting_demo_traveler",
      userId: DEMO_USER_TRAVELER.id,
      memoryEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public async findMemoriesByUser(userId: string): Promise<MemoryRecord[]> {
    if (isDatabaseConnected()) {
      try {
        const records = await prisma.travelerMemory.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
        });
        return records.map(this.mapPrismaToRecord);
      } catch {
        // Fallback to in-memory on error
      }
    }

    const list = this.inMemoryRecords.get(userId) || [];
    return [...list].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public async findMemoryByKey(
    userId: string,
    type: MemoryType,
    key: string,
  ): Promise<MemoryRecord | null> {
    if (isDatabaseConnected()) {
      try {
        const found = await prisma.travelerMemory.findUnique({
          where: {
            userId_type_key: { userId, type, key },
          },
        });
        return found ? this.mapPrismaToRecord(found) : null;
      } catch {
        // Fallback
      }
    }

    const list = this.inMemoryRecords.get(userId) || [];
    const match = list.find((m) => m.type === type && m.key === key);
    return match || null;
  }

  public async findMemoryById(userId: string, memoryId: string): Promise<MemoryRecord | null> {
    if (isDatabaseConnected()) {
      try {
        const found = await prisma.travelerMemory.findFirst({
          where: { id: memoryId, userId },
        });
        return found ? this.mapPrismaToRecord(found) : null;
      } catch {
        // Fallback
      }
    }

    const list = this.inMemoryRecords.get(userId) || [];
    const match = list.find((m) => m.id === memoryId);
    return match || null;
  }

  public async upsertMemory(data: {
    userId: string;
    type: MemoryType;
    key: string;
    value: string;
    source: MemorySource;
    confidence: MemoryConfidence;
    weight: number;
    evidenceCount: number;
    userVisible?: boolean;
  }): Promise<MemoryRecord> {
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const result = await prisma.travelerMemory.upsert({
          where: {
            userId_type_key: {
              userId: data.userId,
              type: data.type,
              key: data.key,
            },
          },
          update: {
            value: data.value,
            source: data.source,
            confidence: data.confidence,
            weight: data.weight,
            evidenceCount: data.evidenceCount,
            updatedAt: now,
            userVisible: data.userVisible ?? true,
          },
          create: {
            userId: data.userId,
            type: data.type,
            key: data.key,
            value: data.value,
            source: data.source,
            confidence: data.confidence,
            weight: data.weight,
            evidenceCount: data.evidenceCount,
            userVisible: data.userVisible ?? true,
          },
        });
        return this.mapPrismaToRecord(result);
      } catch {
        // Fallback
      }
    }

    let userList = this.inMemoryRecords.get(data.userId);
    if (!userList) {
      userList = [];
      this.inMemoryRecords.set(data.userId, userList);
    }

    const existingIndex = userList.findIndex((m) => m.type === data.type && m.key === data.key);
    if (existingIndex >= 0) {
      const existing = userList[existingIndex]!;
      const updated: MemoryRecord = {
        ...existing,
        value: data.value,
        source: data.source,
        confidence: data.confidence,
        weight: data.weight,
        evidenceCount: data.evidenceCount,
        updatedAt: now,
        userVisible: data.userVisible ?? existing.userVisible,
      };
      userList[existingIndex] = updated;
      return updated;
    }

    const newRecord: MemoryRecord = {
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: data.userId,
      type: data.type,
      key: data.key,
      value: data.value,
      source: data.source,
      confidence: data.confidence,
      weight: data.weight,
      evidenceCount: data.evidenceCount,
      createdAt: now,
      updatedAt: now,
      userVisible: data.userVisible ?? true,
    };
    userList.push(newRecord);
    return newRecord;
  }

  public async updateMemory(
    userId: string,
    memoryId: string,
    updates: Partial<Pick<MemoryRecord, "weight" | "userVisible">>,
  ): Promise<MemoryRecord | null> {
    if (isDatabaseConnected()) {
      try {
        const updated = await prisma.travelerMemory.updateMany({
          where: { id: memoryId, userId },
          data: {
            ...updates,
            updatedAt: new Date(),
          },
        });
        if (updated.count > 0) {
          return this.findMemoryById(userId, memoryId);
        }
        return null;
      } catch {
        // Fallback
      }
    }

    const userList = this.inMemoryRecords.get(userId) || [];
    const index = userList.findIndex((m) => m.id === memoryId);
    if (index === -1) return null;
    const existing = userList[index]!;

    const updated: MemoryRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    userList[index] = updated;
    return updated;
  }

  public async deleteMemory(userId: string, memoryId: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const deleted = await prisma.travelerMemory.deleteMany({
          where: { id: memoryId, userId },
        });
        return deleted.count > 0;
      } catch {
        // Fallback
      }
    }

    const userList = this.inMemoryRecords.get(userId);
    if (!userList) return false;

    const initialLength = userList.length;
    const filtered = userList.filter((m) => m.id !== memoryId);
    this.inMemoryRecords.set(userId, filtered);
    return filtered.length < initialLength;
  }

  public async clearAllMemories(userId: string): Promise<number> {
    if (isDatabaseConnected()) {
      try {
        const deleted = await prisma.travelerMemory.deleteMany({
          where: { userId },
        });
        return deleted.count;
      } catch {
        // Fallback
      }
    }

    const userList = this.inMemoryRecords.get(userId) || [];
    const count = userList.length;
    this.inMemoryRecords.set(userId, []);
    return count;
  }

  public async recordEvent(event: {
    userId: string;
    memoryId?: string | null;
    eventType: MemoryEventType;
    subjectType?: string | null;
    subjectId?: string | null;
    signalKey: string;
    signalValue: string;
    weightDelta: number;
  }): Promise<MemoryEventRecord> {
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const created = await prisma.memoryEvent.create({
          data: {
            userId: event.userId,
            memoryId: event.memoryId,
            eventType: event.eventType,
            subjectType: event.subjectType,
            subjectId: event.subjectId,
            signalKey: event.signalKey,
            signalValue: event.signalValue,
            weightDelta: event.weightDelta,
            createdAt: now,
          },
        });
        return {
          id: created.id,
          userId: created.userId,
          memoryId: created.memoryId,
          eventType: created.eventType,
          subjectType: created.subjectType,
          subjectId: created.subjectId,
          signalKey: created.signalKey,
          signalValue: created.signalValue,
          weightDelta: created.weightDelta,
          createdAt: created.createdAt,
        };
      } catch {
        // Fallback
      }
    }

    const eventRecord: MemoryEventRecord = {
      id: `mevt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: event.userId,
      memoryId: event.memoryId,
      eventType: event.eventType,
      subjectType: event.subjectType,
      subjectId: event.subjectId,
      signalKey: event.signalKey,
      signalValue: event.signalValue,
      weightDelta: event.weightDelta,
      createdAt: now,
    };
    this.inMemoryEvents.push(eventRecord);
    return eventRecord;
  }

  public async getSetting(userId: string): Promise<MemorySettingRecord> {
    if (isDatabaseConnected()) {
      try {
        const found = await prisma.travelerMemorySetting.findUnique({
          where: { userId },
        });
        if (found) {
          return {
            id: found.id,
            userId: found.userId,
            memoryEnabled: found.memoryEnabled,
            createdAt: found.createdAt,
            updatedAt: found.updatedAt,
          };
        }
      } catch {
        // Fallback
      }
    }

    const existing = this.inMemorySettings.get(userId);
    if (existing) return existing;

    const defaultSetting: MemorySettingRecord = {
      id: `setting_${userId}`,
      userId,
      memoryEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.inMemorySettings.set(userId, defaultSetting);
    return defaultSetting;
  }

  public async updateSetting(userId: string, memoryEnabled: boolean): Promise<MemorySettingRecord> {
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const upserted = await prisma.travelerMemorySetting.upsert({
          where: { userId },
          update: { memoryEnabled, updatedAt: now },
          create: { userId, memoryEnabled, createdAt: now, updatedAt: now },
        });
        return {
          id: upserted.id,
          userId: upserted.userId,
          memoryEnabled: upserted.memoryEnabled,
          createdAt: upserted.createdAt,
          updatedAt: upserted.updatedAt,
        };
      } catch {
        // Fallback
      }
    }

    const updated: MemorySettingRecord = {
      id: `setting_${userId}`,
      userId,
      memoryEnabled,
      createdAt: now,
      updatedAt: now,
    };
    this.inMemorySettings.set(userId, updated);
    return updated;
  }

  private mapPrismaToRecord(prismaRecord: PrismaTravelerMemory): MemoryRecord {
    return {
      id: prismaRecord.id,
      userId: prismaRecord.userId,
      type: prismaRecord.type as MemoryType,
      key: prismaRecord.key,
      value: prismaRecord.value,
      source: prismaRecord.source as MemorySource,
      confidence: prismaRecord.confidence as MemoryConfidence,
      weight: prismaRecord.weight,
      evidenceCount: prismaRecord.evidenceCount,
      lastUsedAt: prismaRecord.lastUsedAt,
      createdAt: prismaRecord.createdAt,
      updatedAt: prismaRecord.updatedAt,
      expiresAt: prismaRecord.expiresAt,
      userVisible: prismaRecord.userVisible,
    };
  }
}

export const memoryRepository = new MemoryRepository();
