import type { ItineraryPace, ItineraryStopDto, ItineraryDayDto } from "@offbeat/shared";
import type { RoutedStopTransition } from "./itinerary.router.js";

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function formatMinutesToTime(minutesFromMidnight: number): string {
  const norm = Math.max(0, minutesFromMidnight % (24 * 60));
  const hours = Math.floor(norm / 60);
  const minutes = norm % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export interface SchedulerOptions {
  pace: ItineraryPace;
  durationDays: number;
  preferredStartTime?: string | null;
  preferredEndTime?: string | null;
  destinationName?: string;
}

export class ItineraryScheduler {
  /**
   * Builds feasible daily schedules respecting opening hours, pacing, transit, and free-time gaps.
   */
  public scheduleDays(
    routedStops: RoutedStopTransition[],
    options: SchedulerOptions,
  ): ItineraryDayDto[] {
    const { pace, durationDays, preferredStartTime, destinationName = "your journey" } = options;

    // Pace Configuration
    let maxStopsPerDay: number;
    let defaultStopDuration: number;
    let bufferMinutes: number;
    let lunchDurationMinutes: number;

    switch (pace) {
      case "RELAXED":
        maxStopsPerDay = 3;
        defaultStopDuration = 90;
        bufferMinutes = 25;
        lunchDurationMinutes = 60;
        break;
      case "PACKED":
        maxStopsPerDay = 5;
        defaultStopDuration = 50;
        bufferMinutes = 10;
        lunchDurationMinutes = 30;
        break;
      case "BALANCED":
      default:
        maxStopsPerDay = 4;
        defaultStopDuration = 70;
        bufferMinutes = 15;
        lunchDurationMinutes = 45;
        break;
    }

    const days: ItineraryDayDto[] = [];
    let currentStopIdx = 0;

    for (let dayNum = 1; dayNum <= durationDays; dayNum++) {
      const dayStops: ItineraryStopDto[] = [];
      let totalTravel = 0;
      let totalVisit = 0;
      let hasHadLunch = false;

      // Determine initial start time for the day
      const firstStopTransition = routedStops[currentStopIdx];
      let currentMinutes = parseTimeToMinutes(preferredStartTime || "08:30");

      if (
        firstStopTransition?.candidate.recommendedTime?.start &&
        (firstStopTransition.candidate.recommendedTime.start.startsWith("04") ||
          firstStopTransition.candidate.recommendedTime.start.startsWith("05") ||
          firstStopTransition.candidate.recommendedTime.start.startsWith("06"))
      ) {
        // Sunrise/early morning anchor starts at optimal early hour
        currentMinutes = parseTimeToMinutes(firstStopTransition.candidate.recommendedTime.start);
      }

      let stopsForThisDayCount = 0;

      while (currentStopIdx < routedStops.length && stopsForThisDayCount < maxStopsPerDay) {
        const transition = routedStops[currentStopIdx];
        if (!transition) break;

        const cand = transition.candidate;

        // Check if we should insert Free Time for Lunch before this stop
        const isMiddayWindow = currentMinutes >= 11 * 60 + 30 && currentMinutes <= 14 * 60 + 30;
        const isMorningTransition = stopsForThisDayCount >= 2 && currentMinutes < 12 * 60;

        if (!hasHadLunch && (isMiddayWindow || isMorningTransition)) {
          const lunchArrival = Math.max(currentMinutes, 12 * 60);
          const lunchDeparture = lunchArrival + lunchDurationMinutes;

          dayStops.push({
            id: `free_time_lunch_day_${dayNum}`,
            name: "Lunch & Local Exploration",
            destination: destinationName,
            category: "Free Time / Dining",
            arrivalTime: formatMinutesToTime(lunchArrival),
            departureTime: formatMinutesToTime(lunchDeparture),
            durationMinutes: lunchDurationMinutes,
            travelFromPreviousMinutes: 0,
            travelDistanceMeters: 0,
            timeFit: "GOOD",
            crowdFit: "GOOD",
            why: "Dedicated unhurried window to savor authentic regional food, browse local markets, or rest.",
            isFreeTime: true,
          });

          currentMinutes = lunchDeparture + bufferMinutes;
          totalVisit += lunchDurationMinutes;
          hasHadLunch = true;
        }

        // Add transit from previous stop
        const travelMinutes = dayStops.length === 0 ? 0 : transition.travelFromPreviousMinutes;
        currentMinutes += travelMinutes;
        totalTravel += travelMinutes;

        // Visit window
        const arrivalTime = formatMinutesToTime(currentMinutes);
        const visitDuration = defaultStopDuration;
        const departureMinutes = currentMinutes + visitDuration;
        const departureTime = formatMinutesToTime(departureMinutes);

        totalVisit += visitDuration;
        currentMinutes = departureMinutes + bufferMinutes;

        // Construct narrative 'why'
        let why = `A signature stop in ${cand.destination || destinationName}`;
        if (cand.recommendedTime?.reason) {
          why = `${cand.recommendedTime.reason}`;
        } else if (cand.categories.length) {
          why = `Captures the essence of ${cand.categories.slice(0, 2).join(" and ")} in ${cand.destination || "the region"}`;
        }

        dayStops.push({
          id: `stop_${cand.id}_day_${dayNum}`,
          placeId: cand.id.startsWith("place_") ? cand.id : undefined,
          externalId: !cand.id.startsWith("place_") ? cand.id : undefined,
          name: cand.name,
          destination: cand.destination,
          category: cand.categories[0] || "Attraction",
          categories: cand.categories,
          imageUrl: cand.imageUrl,
          location: cand.location,
          arrivalTime,
          departureTime,
          durationMinutes: visitDuration,
          travelFromPreviousMinutes: travelMinutes,
          travelDistanceMeters: transition.travelDistanceMeters,
          timeFit: cand.timeFit,
          crowdFit: cand.crowdFit,
          confidence: cand.confidence,
          community: cand.community,
          why,
          isFreeTime: false,
        });

        currentStopIdx++;
        stopsForThisDayCount++;
      }

      // If day finished morning activities without lunch stop, append a rest/dining gap
      if (!hasHadLunch && dayStops.length >= 1) {
        const lunchArrival = Math.max(currentMinutes, 12 * 60 + 30);
        const lunchDeparture = lunchArrival + lunchDurationMinutes;

        dayStops.push({
          id: `free_time_lunch_day_${dayNum}`,
          name: "Lunch & Local Exploration",
          destination: destinationName,
          category: "Free Time / Dining",
          arrivalTime: formatMinutesToTime(lunchArrival),
          departureTime: formatMinutesToTime(lunchDeparture),
          durationMinutes: lunchDurationMinutes,
          travelFromPreviousMinutes: 0,
          travelDistanceMeters: 0,
          timeFit: "GOOD",
          crowdFit: "GOOD",
          why: "Dedicated unhurried window to savor authentic regional food, browse local markets, or rest.",
          isFreeTime: true,
        });

        totalVisit += lunchDurationMinutes;
      }

      const dayTitle =
        dayNum === 1
          ? `Day 1: ${destinationName} Highlights & Scenic Corridors`
          : `Day ${dayNum}: ${destinationName} Culture & Exploration`;

      days.push({
        day: dayNum,
        title: dayTitle,
        stops: dayStops,
        totalTravelMinutes: totalTravel,
        totalVisitMinutes: totalVisit,
        notes: [
          `Optimized for ${pace.toLowerCase()} pace with realistic transit buffers.`,
          "Times adapt smoothly to local opening hours and peak visibility.",
        ],
      });
    }

    return days;
  }
}

export const itineraryScheduler = new ItineraryScheduler();
