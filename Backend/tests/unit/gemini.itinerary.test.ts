import { describe, it, expect } from "vitest";
import { itineraryReasoningOutputSchema } from "../../src/integrations/gemini/gemini.schemas.js";
import {
  validateItineraryCandidateAllowlist,
  checkItineraryBusinessGuards,
} from "../../src/integrations/gemini/gemini.guard.js";
import { buildItineraryReasoningPrompt } from "../../src/integrations/gemini/gemini.prompts.js";
import type { ItineraryReasoningInputDto } from "../../src/integrations/gemini/gemini.types.js";

describe("Phase 13: Gemini Itinerary Schema & Guardrails Unit Tests", () => {
  const sampleInput: ItineraryReasoningInputDto = {
    destination: "Darjeeling",
    regionId: "region_west_bengal",
    pace: "BALANCED",
    durationDays: 1,
    travelTaste: ["mountains", "photography"],
    experienceTaste: ["sunrise", "nature"],
    dayNight: "DAY",
    candidatePlaces: [
      {
        id: "place_tiger_hill",
        name: "Tiger Hill",
        destination: "Darjeeling",
        category: "Viewpoint",
        location: { lat: 26.995, lng: 88.286 },
        timeFit: "GOOD",
        crowdFit: "GOOD",
        recommendedTime: { start: "05:00", end: "08:00", reason: "Sunrise panorama" },
        confidence: { score: 0.95 },
        isMustVisit: true,
      },
      {
        id: "place_batasia_loop",
        name: "Batasia Loop",
        destination: "Darjeeling",
        category: "Heritage Railway",
        location: { lat: 27.016, lng: 88.252 },
        timeFit: "GOOD",
        crowdFit: "GOOD",
        confidence: { score: 0.9 },
        isAlternative: false,
      },
    ],
    draftSchedule: [
      {
        day: 1,
        orderedPlaceIds: ["place_tiger_hill", "place_batasia_loop"],
      },
    ],
  };

  it("validates well-formed Gemini itinerary structured JSON output", () => {
    const validJson = {
      orderedPlaceIds: ["place_tiger_hill", "place_batasia_loop"],
      dayAssignments: [
        {
          day: 1,
          placeIds: ["place_tiger_hill", "place_batasia_loop"],
        },
      ],
      explanation:
        "Starts at Tiger Hill for peak morning light, then smoothly descends toward Batasia Loop minimizing transit.",
      tradeoffs: ["Early start required to beat mist and traffic."],
    };

    const parsed = itineraryReasoningOutputSchema.safeParse(validJson);
    expect(parsed.success).toBe(true);
  });

  it("rejects malformed output missing required fields", () => {
    const invalidJson = {
      orderedPlaceIds: ["place_tiger_hill"],
      // missing dayAssignments, explanation
    };

    const parsed = itineraryReasoningOutputSchema.safeParse(invalidJson);
    expect(parsed.success).toBe(false);
  });

  it("allowlist approves valid candidates", () => {
    const output = {
      orderedPlaceIds: ["place_tiger_hill", "place_batasia_loop"],
      dayAssignments: [{ day: 1, placeIds: ["place_tiger_hill", "place_batasia_loop"] }],
      explanation: "Valid flow",
      tradeoffs: [],
    };

    const result = validateItineraryCandidateAllowlist(output, [
      "place_tiger_hill",
      "place_batasia_loop",
    ]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("allowlist strictly flags hallucinated candidate IDs", () => {
    const output = {
      orderedPlaceIds: ["place_tiger_hill", "place_hallucinated_casino_999"],
      dayAssignments: [{ day: 1, placeIds: ["place_tiger_hill", "place_hallucinated_casino_999"] }],
      explanation: "Attempted hallucination",
      tradeoffs: [],
    };

    const result = validateItineraryCandidateAllowlist(output, [
      "place_tiger_hill",
      "place_batasia_loop",
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("not in approved candidate set"))).toBe(true);
  });

  it("business guard rejects if must-visit place was dropped", () => {
    const output = {
      orderedPlaceIds: ["place_batasia_loop"],
      dayAssignments: [{ day: 1, placeIds: ["place_batasia_loop"] }],
      explanation: "Dropped Tiger Hill",
      tradeoffs: [],
    };

    const result = checkItineraryBusinessGuards(output, sampleInput);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Must-visit place"))).toBe(true);
  });

  it("business guard rejects if a day has 0 stops", () => {
    const output = {
      orderedPlaceIds: ["place_tiger_hill"],
      dayAssignments: [{ day: 1, placeIds: [] }],
      explanation: "Empty day",
      tradeoffs: [],
    };

    const result = checkItineraryBusinessGuards(output, sampleInput);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must have at least one assigned place"))).toBe(
      true,
    );
  });

  it("prompt builder isolates untrusted candidate descriptions with structured guidelines", () => {
    const prompt = buildItineraryReasoningPrompt(sampleInput);
    expect(prompt).toContain("Tiger Hill");
    expect(prompt).toContain("Batasia Loop");
    expect(prompt).toContain("Approved Candidate Places");
  });
});
