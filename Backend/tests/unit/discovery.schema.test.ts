import { describe, it, expect } from "vitest";
import { discoveryRequestSchema } from "../../src/modules/discovery/discovery.schema.js";

describe("Discovery Request Schema Validation", () => {
  it("should validate and sanitize a standard valid discovery request", () => {
    const input = {
      regionId: "IN-WB",
      travelTaste: ["mountains", "photography", "mountains"], // duplicate
      experienceTaste: ["SUNRISE", " peaceful ", ""], // mixed case, whitespace, empty
      dayNight: "DAY",
      preferredTime: "EARLY_MORNING",
      intent: "DISCOVER_PLACES",
      page: "2",
      limit: "15",
    };

    const parsed = discoveryRequestSchema.parse(input);

    expect(parsed.regionId).toBe("IN-WB");
    expect(parsed.travelTaste).toEqual(["mountains", "photography"]); // deduplicated
    expect(parsed.experienceTaste).toEqual(["sunrise", "peaceful"]); // normalized and stripped empty
    expect(parsed.dayNight).toBe("DAY");
    expect(parsed.preferredTime).toBe("EARLY_MORNING");
    expect(parsed.intent).toBe("DISCOVER_PLACES");
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(15);
  });

  it("should apply sensible defaults for optional fields", () => {
    const input = {
      regionId: "IN-WB",
    };

    const parsed = discoveryRequestSchema.parse(input);

    expect(parsed.regionId).toBe("IN-WB");
    expect(parsed.travelTaste).toEqual([]);
    expect(parsed.experienceTaste).toEqual([]);
    expect(parsed.dayNight).toBe("DAY");
    expect(parsed.intent).toBe("DISCOVER_PLACES");
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(12);
  });

  it("should reject missing or empty regionId", () => {
    expect(() => discoveryRequestSchema.parse({})).toThrow();
    expect(() => discoveryRequestSchema.parse({ regionId: "" })).toThrow();
    expect(() => discoveryRequestSchema.parse({ regionId: "   " })).toThrow();
  });

  it("should reject page < 1 and limit < 1", () => {
    expect(() => discoveryRequestSchema.parse({ regionId: "IN-WB", page: 0 })).toThrow();
    expect(() => discoveryRequestSchema.parse({ regionId: "IN-WB", limit: 0 })).toThrow();
  });

  it("should reject limit > 50", () => {
    expect(() => discoveryRequestSchema.parse({ regionId: "IN-WB", limit: 100 })).toThrow();
  });

  it("should reject invalid dayNight enum", () => {
    expect(() =>
      discoveryRequestSchema.parse({ regionId: "IN-WB", dayNight: "INVALID_TIME" }),
    ).toThrow();
  });

  it("should reject invalid intent enum", () => {
    expect(() =>
      discoveryRequestSchema.parse({ regionId: "IN-WB", intent: "UNSUPPORTED_INTENT" }),
    ).toThrow();
  });
});
