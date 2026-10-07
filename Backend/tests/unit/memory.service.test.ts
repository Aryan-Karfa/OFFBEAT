import { describe, it, expect, beforeEach } from "vitest";
import { MemoryService } from "../../src/modules/memory/memory.service.js";
import { MemoryRepository } from "../../src/modules/memory/memory.repository.js";

describe("Phase 15: MemoryService Unit Tests", () => {
  let repo: MemoryRepository;
  let service: MemoryService;
  const testUserId = "user_test_traveler_unit";

  beforeEach(async () => {
    repo = new MemoryRepository();
    service = new MemoryService(repo);
  });

  it("records interaction events and updates aggregate memory deterministically", async () => {
    const result = await service.recordEvent(testUserId, {
      eventType: "TASTE_SELECTED",
      signalKey: "mountains",
      signalValue: "Mountains",
    });

    expect(result.memory).not.toBeNull();
    expect(result.memory?.key).toBe("mountains");
    expect(result.memory?.source).toBe("EXPLICIT");
    expect(result.memory?.confidence).toBe("HIGH");
    expect(result.memory?.evidenceCount).toBe(1);

    // Reinforce the signal
    const secondEvent = await service.recordEvent(testUserId, {
      eventType: "PLACE_EXPLORED",
      signalKey: "mountains",
      signalValue: "Mountains",
    });

    expect(secondEvent.memory?.evidenceCount).toBe(2);
    expect(secondEvent.memory?.weight).toBeGreaterThanOrEqual(result.memory!.weight);
  });

  it("blocks sensitive signals and throws error without recording memory", async () => {
    await expect(
      service.recordEvent(testUserId, {
        eventType: "CATEGORY_SELECTED",
        signalKey: "political_stance",
        signalValue: "election candidate",
      }),
    ).rejects.toThrow("Sensitive signals cannot be stored");
  });

  it("respects memoryEnabled toggle by not persisting memory when disabled", async () => {
    // Disable memory
    await service.updateSetting(testUserId, false);

    const result = await service.recordEvent(testUserId, {
      eventType: "TASTE_SELECTED",
      signalKey: "heritage",
      signalValue: "Heritage",
    });

    // Memory is null because memory persistence is disabled
    expect(result.memory).toBeNull();
    const memories = await service.getMemories(testUserId);
    expect(memories).toHaveLength(0);
  });

  it("retrieves memories with explanations and allows deleting individual memories", async () => {
    await service.recordEvent(testUserId, {
      eventType: "TASTE_SELECTED",
      signalKey: "wildlife",
      signalValue: "Wildlife",
    });

    const memories = await service.getMemories(testUserId);
    expect(memories.length).toBeGreaterThan(0);
    const targetMemory = memories.find((m) => m.key === "wildlife")!;
    expect(targetMemory.explanation).toContain("You directly selected Wildlife");

    // Delete the memory
    const deleted = await service.deleteMemoryItem(testUserId, targetMemory.id);
    expect(deleted).toBe(true);

    const afterDelete = await service.getMemories(testUserId);
    expect(afterDelete.find((m) => m.id === targetMemory.id)).toBeUndefined();
  });

  it("clears all memories completely upon user request", async () => {
    await service.recordEvent(testUserId, {
      eventType: "TASTE_SELECTED",
      signalKey: "nature",
      signalValue: "Nature",
    });
    await service.recordEvent(testUserId, {
      eventType: "EXPERIENCE_SELECTED",
      signalKey: "sunset",
      signalValue: "Sunset",
    });

    const clearedCount = await service.clearAllMemories(testUserId);
    expect(clearedCount).toBeGreaterThanOrEqual(2);

    const profile = await service.getPersonalizationProfile(testUserId);
    expect(profile.totalMemoriesCount).toBe(0);
    expect(profile.travelTaste).toHaveLength(0);
  });

  it("generates sanitized Gemini memory context with strict boundaries", async () => {
    await service.recordEvent(testUserId, {
      eventType: "TASTE_SELECTED",
      signalKey: "mountains",
      signalValue: "Mountains",
    });
    await service.recordEvent(testUserId, {
      eventType: "EXPERIENCE_SELECTED",
      signalKey: "sunrise",
      signalValue: "Sunrise",
    });

    const geminiContext = await service.getSanitizedGeminiMemoryContext(testUserId);
    expect(geminiContext).not.toBeNull();
    expect(geminiContext?.explicitTravelTastes).toContain("mountains");
    expect(geminiContext?.explicitExperienceTastes).toContain("sunrise");
    expect(geminiContext?.confidenceLevel).toBe("HIGH");
  });
});
