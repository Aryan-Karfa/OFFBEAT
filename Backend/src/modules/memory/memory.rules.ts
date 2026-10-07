import {
  type MemoryType,
  type MemorySource,
  type MemoryConfidence,
  type MemoryEventType,
  MEMORY_WEIGHT_CONFIG,
  SENSITIVE_MEMORY_PATTERNS,
} from "./memory.types.js";

export class MemoryRules {
  /**
   * Evaluates whether a signal violates privacy guidelines by containing sensitive personal data.
   */
  public static isSensitiveSignal(key: string, value: string): boolean {
    const combined = `${key} ${value}`.toLowerCase();
    return SENSITIVE_MEMORY_PATTERNS.some((pattern) => pattern.test(combined));
  }

  /**
   * Applies deterministic bounded decay to weights.
   * Explicit preferences decay very slowly (e.g. 90-day half-life).
   * Inferred preferences decay moderately (e.g. 21-day half-life).
   */
  public static calculateDecayedWeight(
    currentWeight: number,
    source: MemorySource,
    lastUpdated: Date,
    now: Date = new Date(),
  ): number {
    const elapsedDays = Math.max(0, (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    
    // Explicit preferences do not decay below 0.85
    if (source === "EXPLICIT") {
      const explicitDecay = Math.pow(0.5, elapsedDays / 90);
      return Math.max(0.85, Number((currentWeight * explicitDecay).toFixed(3)));
    }

    // Inferred / interaction preferences decay with a 21-day half life
    const inferredDecay = Math.pow(0.5, elapsedDays / 21);
    const decayed = currentWeight * inferredDecay;
    
    // Clamp between 0.05 and 1.0
    return Math.max(0.05, Math.min(1.0, Number(decayed.toFixed(3))));
  }

  /**
   * Calculates new weight and evidence count given an event's weight delta.
   */
  public static updateWeight(
    existingWeight: number,
    existingCount: number,
    weightDelta: number,
    source: MemorySource,
  ): { newWeight: number; newCount: number; newConfidence: MemoryConfidence } {
    const newCount = existingCount + 1;
    let newWeight = existingWeight + weightDelta * 0.4;

    // Bound weight between 0.05 and 1.0
    newWeight = Math.max(0.05, Math.min(1.0, Number(newWeight.toFixed(3))));

    // Calculate confidence based on source and evidence count
    let newConfidence: MemoryConfidence = "MODERATE";
    if (source === "EXPLICIT" || newCount >= 4 || newWeight >= 0.8) {
      newConfidence = "HIGH";
    } else if (newCount <= 1 && newWeight < 0.4) {
      newConfidence = "LOW";
    }

    return {
      newWeight,
      newCount,
      newConfidence,
    };
  }

  /**
   * Formulates transparent, user-understandable explanations for why a memory exists.
   */
  public static generateExplanation(
    type: MemoryType,
    key: string,
    value: string,
    source: MemorySource,
    evidenceCount: number,
  ): string {
    const label = value || key;

    if (source === "EXPLICIT") {
      return `You directly selected ${label} in your travel preferences.`;
    }

    switch (type) {
      case "PACE":
        return `Preferred pace inferred from ${evidenceCount} generated itineraries.`;
      case "ALTERNATIVE_PREFERENCE":
        return `You frequently chose "${label}" mode when finding alternative stops.`;
      case "CATEGORY_AFFINITY":
        return `Inferred from your repeated interest in ${label} destinations and experiences.`;
      case "TAKE_HOME_PREFERENCE":
        return `You frequently explored or selected ${label} take-home local finds.`;
      case "TIME_PREFERENCE":
        return `You often prefer ${label} hours for your travel stops.`;
      case "EXPERIENCE":
      case "TASTE":
        return `You frequently showed interest in ${label} across recent journeys.`;
      default:
        return `Inferred from ${evidenceCount} travel interactions across OFFBEAT.`;
    }
  }

  /**
   * Infers memory type and attributes from an incoming event if not explicitly specified.
   */
  public static deriveEventAttributes(eventType: MemoryEventType) {
    return MEMORY_WEIGHT_CONFIG[eventType] || {
      weightDelta: 0.2,
      source: "INTERACTION",
      defaultType: "CATEGORY_AFFINITY",
      initialConfidence: "MODERATE",
    };
  }
}
