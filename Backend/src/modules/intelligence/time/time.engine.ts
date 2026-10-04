import type {
  TimeCalculationInputs,
  TimeIntelligenceDto,
  OperatingHoursDto,
  OperatingWindowDto,
  RecommendedTimeDto,
  AvailableWindowDto,
  TimeTimingSignalDto,
  TimeFit,
} from "./time.types.js";
import { generateTimeExplanation } from "./time.explanations.js";

/**
 * Normalizes 12-hour AM/PM time strings into 24-hour HH:mm format.
 * Examples:
 * "9:00 AM" -> "09:00"
 * "5:30 PM" -> "17:30"
 * "12:00 AM" -> "00:00"
 * "12:00 PM" -> "12:00"
 * "05:00" -> "05:00"
 */
export function normalizeTimeString(timeStr?: string | null): string | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(cleaned)) {
    return cleaned;
  }

  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)$/i);
  if (!match || !match[1] || !match[3]) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3].toUpperCase();

  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Parses raw operating hours strings (e.g. from Google Maps/SerpApi) into structured OperatingHoursDto.
 */
export function parseOperatingHours(rawHours?: string[] | null): OperatingHoursDto {
  if (!rawHours || !Array.isArray(rawHours) || rawHours.length === 0) {
    return {
      schedule: [],
      text: [],
      raw: [],
      isOpenNow: null,
      source: "SYSTEM",
      rawText: null,
    };
  }

  const schedule: OperatingWindowDto[] = [];
  const textLines: string[] = [];

  for (const rawLine of rawHours) {
    if (!rawLine || typeof rawLine !== "string") continue;
    const line = rawLine.trim();
    if (!line) continue;
    textLines.push(line);

    // Case 1: "Open 24 hours"
    if (/open 24 hours/i.test(line)) {
      const dayMatch = line.match(/^([A-Za-z]+):/);
      schedule.push({
        day: dayMatch ? dayMatch[1] : "Everyday",
        open: "00:00",
        close: "24:00",
        closed: false,
        is24Hours: true,
        description: "Open 24 hours",
      });
      continue;
    }

    // Case 2: "Closed"
    if (/:?\s*closed$/i.test(line)) {
      const dayMatch = line.match(/^([A-Za-z]+):/);
      schedule.push({
        day: dayMatch ? dayMatch[1] : "Today",
        open: null,
        close: null,
        closed: true,
        is24Hours: false,
        description: "Closed",
      });
      continue;
    }

    // Case 3: "Monday: 9:00 AM – 5:00 PM" or "5:00 AM - 6:00 PM"
    const splitIndex = line.indexOf(":");
    let day = "General";
    let timesPart = line;
    if (splitIndex > 0 && splitIndex < 15 && !line.substring(0, splitIndex).includes(" ")) {
      day = line.substring(0, splitIndex).trim();
      timesPart = line.substring(splitIndex + 1).trim();
    }

    const ranges = timesPart
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    const parsedWindows: Array<{ open: string | null; close: string | null }> = [];

    for (const r of ranges) {
      const match = r.match(
        /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s*(?:–|-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i,
      );
      if (match) {
        parsedWindows.push({
          open: normalizeTimeString(match[1]),
          close: normalizeTimeString(match[2]),
        });
      }
    }

    if (parsedWindows.length > 0) {
      const first = parsedWindows[0];
      const last = parsedWindows[parsedWindows.length - 1];
      schedule.push({
        day,
        open: first?.open ?? null,
        close: last?.close ?? null,
        closed: false,
        is24Hours: false,
        description: timesPart,
        windows: parsedWindows.length > 1 ? parsedWindows : undefined,
      });
    } else {
      schedule.push({
        day,
        description: timesPart,
        closed: false,
      });
    }
  }

  return {
    schedule,
    text: textLines,
    raw: textLines,
    isOpenNow: null,
    source: "EXTERNAL",
    rawText: textLines.join(" | "),
  };
}

export const parseOperatingHoursList = parseOperatingHours;

/**
 * Deterministically evaluates the Time Fit score/category.
 */
export function evaluateTimeFit(
  userDayNight?: "DAY" | "NIGHT" | "ANY",
  preferredTime?: string | null,
  operatingHoursOrTastes?: OperatingHoursDto | string[] | null,
  recommendedTimes?: RecommendedTimeDto[],
): TimeFit {
  if (!userDayNight || userDayNight === "ANY") {
    return (recommendedTimes && recommendedTimes.length > 0) ||
      (operatingHoursOrTastes &&
        !Array.isArray(operatingHoursOrTastes) &&
        (operatingHoursOrTastes.schedule?.length ?? 0) > 0)
      ? "GOOD"
      : "UNKNOWN";
  }

  const operatingHours = Array.isArray(operatingHoursOrTastes) ? undefined : operatingHoursOrTastes;
  const tastes = Array.isArray(operatingHoursOrTastes) ? operatingHoursOrTastes : undefined;

  // If user requested NIGHT:
  if (userDayNight === "NIGHT") {
    const isSunriseTaste = tastes?.some((t) => t.toLowerCase().includes("sunrise"));
    if (recommendedTimes && recommendedTimes.length > 0) {
      const hasNightTip = recommendedTimes.some((r) => {
        const parts = r.start.split(":");
        const startH = parts[0] ? parseInt(parts[0], 10) : 0;
        return startH >= 19 || startH <= 4;
      });
      const allDayTips = recommendedTimes.every((r) => {
        const parts = r.start.split(":");
        const startH = parts[0] ? parseInt(parts[0], 10) : 0;
        return startH >= 5 && startH < 19;
      });

      if (!hasNightTip && (allDayTips || isSunriseTaste)) {
        return "CONFLICT";
      }
    } else if (isSunriseTaste) {
      return "CONFLICT";
    }
  }

  // If user requested DAY:
  if (userDayNight === "DAY") {
    if (recommendedTimes && recommendedTimes.length > 0) {
      const hasDayTip = recommendedTimes.some((r) => {
        const parts = r.start.split(":");
        const startH = parts[0] ? parseInt(parts[0], 10) : 0;
        return startH >= 5 && startH < 19;
      });
      const allNightTips = recommendedTimes.every((r) => {
        const parts = r.start.split(":");
        const startH = parts[0] ? parseInt(parts[0], 10) : 0;
        return startH >= 19 || startH <= 4;
      });

      if (!hasDayTip && allNightTips) {
        return "CONFLICT";
      }
    }
  }

  // Check operating hours accessibility
  if (operatingHours && operatingHours.schedule && operatingHours.schedule.length > 0) {
    const allClosed = operatingHours.schedule.every((s) => s.closed);
    if (allClosed) return "CONFLICT";

    const hasNightOpening = operatingHours.schedule.some((s) => {
      if (s.is24Hours) return true;
      if (s.close) {
        const parts = s.close.split(":");
        const closeH = parts[0] ? parseInt(parts[0], 10) : 0;
        return closeH >= 20 || closeH <= 4;
      }
      return false;
    });

    if (userDayNight === "NIGHT" && !hasNightOpening) {
      return "PARTIAL";
    }
  }

  return "GOOD";
}

/**
 * Deterministic Time Intelligence Engine
 * Evaluates operating facts, community timing, day/night context, and experience windows.
 */
export function calculateTimeIntelligence(inputs: TimeCalculationInputs): TimeIntelligenceDto {
  const now = new Date();

  // 1. Operating / Opening Information (Fact)
  const operatingHours = parseOperatingHours(inputs.openingHours);

  // 2. Active, unexpired Time Observations
  const activeObservations = (inputs.observations || []).filter((obs) => {
    if (!obs.expiresAt) return true;
    return new Date(obs.expiresAt) > now;
  });

  // 3. Recommended times extraction from community observations and submissions
  const recommendedTimes: RecommendedTimeDto[] = [];
  const signals: TimeTimingSignalDto[] = [];

  // Add signals from operating hours
  if (operatingHours.schedule && operatingHours.schedule.length > 0) {
    const firstSchedule = operatingHours.schedule[0];
    if (firstSchedule && firstSchedule.open && firstSchedule.close) {
      signals.push({
        type: "OPERATING_HOURS",
        description: `Operating hours: ${firstSchedule.open} – ${firstSchedule.close}`,
        source: "EXTERNAL",
      });
    } else if (firstSchedule && firstSchedule.is24Hours) {
      signals.push({
        type: "OPERATING_HOURS",
        description: "Open 24 hours daily",
        source: "EXTERNAL",
      });
    }
  }

  // Add recommendations from structured TimeObservation records
  for (const obs of activeObservations) {
    recommendedTimes.push({
      start: obs.startTime,
      end: obs.endTime,
      dayType: obs.dayType,
      reason: obs.observation || "Community recommended time",
      source: obs.source,
      confidence: obs.confidence || 0.8,
      evidenceStrength: (obs.confidence || 0.8) >= 0.7 ? "HIGH" : "MODERATE",
    });

    signals.push({
      type: obs.type,
      description: obs.observation
        ? `${obs.startTime}–${obs.endTime}: ${obs.observation}`
        : `Recommended window: ${obs.startTime}–${obs.endTime}`,
      source: obs.source,
    });
  }

  // Derive additional community timing from Phase 8 submissions if no explicit time observations exist
  if (recommendedTimes.length === 0 && inputs.communitySubmissions) {
    const bestTimeSubs = inputs.communitySubmissions.filter(
      (s) => s.type === "BEST_TIME" && s.status === "APPROVED",
    );

    for (const sub of bestTimeSubs) {
      // Heuristic extraction for known demo submissions (Tiger Hill, Batasia Loop, Victoria Memorial)
      if (
        sub.title.toLowerCase().includes("first light") ||
        sub.content.toLowerCase().includes("sunrise")
      ) {
        recommendedTimes.push({
          start: "04:30",
          end: "05:30",
          dayType: "ANY",
          reason: sub.title,
          source: "COMMUNITY",
          confidence: 0.85,
          evidenceStrength: "HIGH",
        });
        signals.push({
          type: "COMMUNITY_RECOMMENDED_TIME",
          description: `Community tip: ${sub.title}`,
          source: "COMMUNITY",
        });
      } else if (
        sub.title.toLowerCase().includes("golden hour") ||
        sub.content.toLowerCase().includes("sunset")
      ) {
        recommendedTimes.push({
          start: "16:30",
          end: "17:45",
          dayType: "ANY",
          reason: sub.title,
          source: "COMMUNITY",
          confidence: 0.8,
          evidenceStrength: "MODERATE",
        });
        signals.push({
          type: "COMMUNITY_RECOMMENDED_TIME",
          description: `Community tip: ${sub.title}`,
          source: "COMMUNITY",
        });
      }
    }
  }

  // Available Windows (from operating hours or general open times)
  const availableWindows: AvailableWindowDto[] = [];
  if (operatingHours.schedule && operatingHours.schedule.length > 0) {
    for (const win of operatingHours.schedule) {
      if (win.open && win.close && !win.closed) {
        availableWindows.push({
          start: win.open,
          end: win.close,
          label: win.day ? `${win.day} operating window` : "Operating window",
          source: "EXTERNAL",
        });
      }
    }
  } else if (recommendedTimes.length > 0) {
    for (const rec of recommendedTimes) {
      availableWindows.push({
        start: rec.start,
        end: rec.end,
        label: rec.reason || "Recommended experience window",
        source: rec.source,
      });
    }
  }

  // 4. Calculate Time Fit
  const timeFit = evaluateTimeFit(
    inputs.userDayNight,
    inputs.preferredTime,
    operatingHours,
    recommendedTimes,
  );

  // 5. Generate Safe, Non-dogmatic Explanation
  const explanation = generateTimeExplanation(
    operatingHours,
    recommendedTimes,
    inputs.experienceTastes,
  );

  return {
    operatingHours,
    recommendedTimes,
    availableWindows,
    signals,
    explanation,
    timeFit,
  };
}
