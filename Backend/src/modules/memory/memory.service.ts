import { logger } from "../../lib/logger/logger.js";
import { memoryRepository, type MemoryRepository } from "./memory.repository.js";
import { MemoryRules } from "./memory.rules.js";
import {
  type MemoryConfidence,
  type TravelerMemoryDto,
  type MemoryEventDto,
  type CreateMemoryEventDto,
  type TravelerPersonalizationProfileDto,
  type MemorySettingDto,
  type UpdateMemoryItemDto,
  type GeminiSanitizedMemoryContext,
  type MemoryRecord,
} from "./memory.types.js";

export class MemoryService {
  constructor(private repo: MemoryRepository = memoryRepository) {}

  /**
   * Ingests a traveler interaction event, updates aggregate memory with deterministic rules,
   * and records the event for auditing.
   */
  public async recordEvent(
    userId: string,
    input: CreateMemoryEventDto,
  ): Promise<{ memory: TravelerMemoryDto | null; event: MemoryEventDto }> {
    // 1. Check if traveler memory is enabled
    const setting = await this.repo.getSetting(userId);
    if (!setting.memoryEnabled) {
      logger.info(
        "[MemoryService] Memory is disabled for user; skipping persistent memory update",
        undefined,
        {
          userId,
          eventType: input.eventType,
        },
      );
      const eventRec = await this.repo.recordEvent({
        userId,
        eventType: input.eventType,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        signalKey: input.signalKey,
        signalValue: input.signalValue,
        weightDelta: 0,
      });
      return {
        memory: null,
        event: {
          id: eventRec.id,
          userId: eventRec.userId,
          eventType: eventRec.eventType,
          subjectType: eventRec.subjectType,
          subjectId: eventRec.subjectId,
          signalKey: eventRec.signalKey,
          signalValue: eventRec.signalValue,
          weightDelta: eventRec.weightDelta,
          createdAt: eventRec.createdAt.toISOString(),
        },
      };
    }

    // 2. Privacy & Data Minimization Guard
    if (MemoryRules.isSensitiveSignal(input.signalKey, input.signalValue)) {
      logger.warn(
        "[MemoryService] Rejected sensitive signal attempting to enter memory",
        undefined,
        {
          userId,
          signalKey: input.signalKey,
        },
      );
      throw new Error("Sensitive signals cannot be stored in traveler memory");
    }

    // 3. Derive deterministic attributes for the event
    const derived = MemoryRules.deriveEventAttributes(input.eventType);
    const weightDelta = input.weightDelta ?? derived.weightDelta;
    const targetType = derived.defaultType;
    const targetSource = derived.source;

    // 4. Check for existing aggregate memory
    let existing = await this.repo.findMemoryByKey(userId, targetType, input.signalKey);
    let resolvedType = targetType;

    // If an existing taste or experience already exists with this signal key, reinforce it
    if (!existing) {
      const explicitTaste = await this.repo.findMemoryByKey(userId, "TASTE", input.signalKey);
      if (explicitTaste) {
        existing = explicitTaste;
        resolvedType = "TASTE";
      } else {
        const explicitExp = await this.repo.findMemoryByKey(userId, "EXPERIENCE", input.signalKey);
        if (explicitExp) {
          existing = explicitExp;
          resolvedType = "EXPERIENCE";
        }
      }
    }

    let updatedRecord: MemoryRecord;

    if (existing) {
      // Apply decay to existing weight before applying new delta
      const decayedExistingWeight = MemoryRules.calculateDecayedWeight(
        existing.weight,
        existing.source,
        existing.updatedAt,
      );

      const { newWeight, newCount, newConfidence } = MemoryRules.updateWeight(
        decayedExistingWeight,
        existing.evidenceCount,
        weightDelta,
        targetSource === "EXPLICIT" ? "EXPLICIT" : existing.source,
      );

      updatedRecord = await this.repo.upsertMemory({
        userId,
        type: existing.type,
        key: input.signalKey,
        value: input.signalValue || existing.value,
        source: targetSource === "EXPLICIT" ? "EXPLICIT" : existing.source,
        confidence: newConfidence,
        weight: newWeight,
        evidenceCount: newCount,
        userVisible: true,
      });
    } else {
      // Initial creation
      const initialWeight = Math.max(0.1, Math.min(1.0, weightDelta > 0 ? weightDelta : 0.5));
      updatedRecord = await this.repo.upsertMemory({
        userId,
        type: resolvedType,
        key: input.signalKey,
        value: input.signalValue,
        source: targetSource,
        confidence: derived.initialConfidence,
        weight: initialWeight,
        evidenceCount: 1,
        userVisible: true,
      });
    }

    // 5. Record minimal event log
    const eventRec = await this.repo.recordEvent({
      userId,
      memoryId: updatedRecord.id,
      eventType: input.eventType,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      signalKey: input.signalKey,
      signalValue: input.signalValue,
      weightDelta,
    });

    logger.debug("[MemoryService] Memory successfully updated", undefined, {
      userId,
      type: updatedRecord.type,
      key: updatedRecord.key,
      weight: updatedRecord.weight,
    });

    return {
      memory: this.mapRecordToDto(updatedRecord),
      event: {
        id: eventRec.id,
        userId: eventRec.userId,
        memoryId: eventRec.memoryId,
        eventType: eventRec.eventType,
        subjectType: eventRec.subjectType,
        subjectId: eventRec.subjectId,
        signalKey: eventRec.signalKey,
        signalValue: eventRec.signalValue,
        weightDelta: eventRec.weightDelta,
        createdAt: eventRec.createdAt.toISOString(),
      },
    };
  }

  /**
   * Retrieves all user memories with decayed weights and explainability text.
   */
  public async getMemories(userId: string): Promise<TravelerMemoryDto[]> {
    const setting = await this.repo.getSetting(userId);
    if (!setting.memoryEnabled) {
      return [];
    }

    const records = await this.repo.findMemoriesByUser(userId);
    const now = new Date();

    return records
      .filter((r) => r.userVisible)
      .map((r) => {
        const decayedWeight = MemoryRules.calculateDecayedWeight(
          r.weight,
          r.source,
          r.updatedAt,
          now,
        );
        return {
          id: r.id,
          userId: r.userId,
          type: r.type,
          key: r.key,
          value: r.value,
          source: r.source,
          confidence: r.confidence,
          weight: decayedWeight,
          evidenceCount: r.evidenceCount,
          explanation: MemoryRules.generateExplanation(
            r.type,
            r.key,
            r.value,
            r.source,
            r.evidenceCount,
          ),
          lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
          userVisible: r.userVisible,
        };
      })
      .filter((m) => m.weight >= 0.1); // Discard negligible traces
  }

  /**
   * Generates a normalized traveler personalization profile for downstream engines.
   */
  public async getPersonalizationProfile(
    userId: string,
  ): Promise<TravelerPersonalizationProfileDto> {
    const setting = await this.repo.getSetting(userId);
    if (!setting.memoryEnabled) {
      return {
        userId,
        memoryEnabled: false,
        travelTaste: [],
        experienceTaste: [],
        categoryAffinities: [],
        destinationAffinities: [],
        topExplicitSignals: [],
        topInferredSignals: [],
        totalMemoriesCount: 0,
        lastUpdated: setting.updatedAt.toISOString(),
      };
    }

    const memories = await this.getMemories(userId);

    const travelTastes: string[] = [];
    const expTastes: string[] = [];
    let pace: string | undefined;
    let alternativePreference: string | undefined;
    const takeHomePrefs: string[] = [];
    const categoryAffinities: { category: string; weight: number; confidence: MemoryConfidence }[] =
      [];
    const destinationAffinities: { destinationId: string; weight: number }[] = [];
    const topExplicit: string[] = [];
    const topInferred: string[] = [];

    for (const mem of memories) {
      if (mem.source === "EXPLICIT") {
        topExplicit.push(mem.value || mem.key);
      } else {
        topInferred.push(mem.value || mem.key);
      }

      switch (mem.type) {
        case "TASTE":
          if (!travelTastes.includes(mem.key)) travelTastes.push(mem.key);
          break;
        case "EXPERIENCE":
          if (!expTastes.includes(mem.key)) expTastes.push(mem.key);
          break;
        case "PACE":
          if (!pace) pace = mem.value;
          break;
        case "ALTERNATIVE_PREFERENCE":
          if (!alternativePreference) alternativePreference = mem.value;
          break;
        case "TAKE_HOME_PREFERENCE":
          if (!takeHomePrefs.includes(mem.value)) takeHomePrefs.push(mem.value);
          break;
        case "CATEGORY_AFFINITY":
          categoryAffinities.push({
            category: mem.key,
            weight: mem.weight,
            confidence: mem.confidence,
          });
          break;
        case "DESTINATION_AFFINITY":
          destinationAffinities.push({
            destinationId: mem.key,
            weight: mem.weight,
          });
          break;
      }
    }

    // Sort category affinities descending by weight
    categoryAffinities.sort((a, b) => b.weight - a.weight);

    return {
      userId,
      memoryEnabled: true,
      travelTaste: travelTastes,
      experienceTaste: expTastes,
      pace,
      categoryAffinities,
      destinationAffinities,
      alternativePreference,
      takeHomePreference: takeHomePrefs,
      topExplicitSignals: topExplicit.slice(0, 5),
      topInferredSignals: topInferred.slice(0, 5),
      totalMemoriesCount: memories.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Modifies an existing memory entry (e.g. visibility or weight).
   */
  public async updateMemoryItem(
    userId: string,
    memoryId: string,
    updates: UpdateMemoryItemDto,
  ): Promise<TravelerMemoryDto | null> {
    const updated = await this.repo.updateMemory(userId, memoryId, updates);
    return updated ? this.mapRecordToDto(updated) : null;
  }

  /**
   * Deletes a specific memory item belonging to the authenticated user.
   */
  public async deleteMemoryItem(userId: string, memoryId: string): Promise<boolean> {
    const success = await this.repo.deleteMemory(userId, memoryId);
    if (success) {
      logger.info("[MemoryService] Traveler deleted memory item", undefined, { userId, memoryId });
    }
    return success;
  }

  /**
   * Completely purges all memories for a traveler with confirmation.
   */
  public async clearAllMemories(userId: string): Promise<number> {
    const count = await this.repo.clearAllMemories(userId);
    logger.info("[MemoryService] Traveler cleared all memory records", undefined, {
      userId,
      count,
    });
    return count;
  }

  /**
   * Fetches the current memory settings for the user.
   */
  public async getSetting(userId: string): Promise<MemorySettingDto> {
    const record = await this.repo.getSetting(userId);
    return {
      userId: record.userId,
      memoryEnabled: record.memoryEnabled,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  /**
   * Updates memory settings (e.g. enabling or disabling memory).
   */
  public async updateSetting(userId: string, memoryEnabled: boolean): Promise<MemorySettingDto> {
    const record = await this.repo.updateSetting(userId, memoryEnabled);
    logger.info("[MemoryService] Traveler updated memory settings", undefined, {
      userId,
      memoryEnabled,
    });
    return {
      userId: record.userId,
      memoryEnabled: record.memoryEnabled,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  /**
   * Generates a sanitized memory context object for Gemini prompt injection boundaries.
   * Strips all internal IDs, dates, and sensitive properties.
   */
  public async getSanitizedGeminiMemoryContext(
    userId: string,
  ): Promise<GeminiSanitizedMemoryContext | null> {
    const profile = await this.getPersonalizationProfile(userId);
    if (!profile.memoryEnabled || profile.totalMemoriesCount === 0) {
      return null;
    }

    return {
      explicitTravelTastes: profile.travelTaste,
      explicitExperienceTastes: profile.experienceTaste,
      inferredInterests: profile.topInferredSignals,
      preferredPace: profile.pace,
      alternativeBias: profile.alternativePreference,
      takeHomeCategoryBias: profile.takeHomePreference,
      confidenceLevel: profile.topExplicitSignals.length > 0 ? "HIGH" : "MODERATE",
    };
  }

  private mapRecordToDto(record: MemoryRecord): TravelerMemoryDto {
    return {
      id: record.id,
      userId: record.userId,
      type: record.type,
      key: record.key,
      value: record.value,
      source: record.source,
      confidence: record.confidence,
      weight: record.weight,
      evidenceCount: record.evidenceCount,
      explanation: MemoryRules.generateExplanation(
        record.type,
        record.key,
        record.value,
        record.source,
        record.evidenceCount,
      ),
      lastUsedAt: record.lastUsedAt ? record.lastUsedAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      expiresAt: record.expiresAt ? record.expiresAt.toISOString() : null,
      userVisible: record.userVisible,
    };
  }
}

export const memoryService = new MemoryService();
