import React, { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useItineraryStore } from "../../stores/itineraryStore";
import { useTasteStore } from "../../stores/tasteStore";
import type { ItineraryPace } from "@offbeat/shared";
import {
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Flame,
  Coffee,
  Compass,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const ItineraryBuilder: React.FC<{
  onGenerated?: () => void;
  defaultDestination?: string;
  defaultMustVisitId?: string;
}> = ({ onGenerated, defaultDestination = "Darjeeling", defaultMustVisitId }) => {
  const { request, setRequest, generateItinerary, loading } = useItineraryStore();
  const { selectedTravelTastes: profileTravelTaste, selectedExperienceTastes: profileExpTaste } =
    useTasteStore();

  const [destination, setDestination] = useState(defaultDestination);
  const [pace, setPace] = useState<ItineraryPace>(request.pace || "BALANCED");
  const [dayNight, setDayNight] = useState<"DAY" | "NIGHT" | "ANY">(request.dayNight || "DAY");
  const [startTime, setStartTime] = useState(request.preferredStartTime || "06:00");
  const [endTime, setEndTime] = useState(request.preferredEndTime || "20:00");
  const [durationDays, setDurationDays] = useState(request.durationDays || 1);

  // Available tastes for toggle
  const availableTravelTastes = [
    "mountains",
    "heritage",
    "photography",
    "tea",
    "trekking",
    "architecture",
  ];
  const availableExpTastes = [
    "sunrise",
    "scenic railway",
    "nature",
    "peace & quiet",
    "local food",
    "panoramic views",
  ];

  const [selectedTravelTastes, setSelectedTravelTastes] = useState<string[]>(
    request.travelTaste && request.travelTaste.length > 0
      ? request.travelTaste
      : profileTravelTaste && profileTravelTaste.length > 0
        ? profileTravelTaste
        : ["mountains", "photography"],
  );

  const [selectedExpTastes, setSelectedExpTastes] = useState<string[]>(
    request.experienceTaste && request.experienceTaste.length > 0
      ? request.experienceTaste
      : profileExpTaste && profileExpTaste.length > 0
        ? profileExpTaste
        : ["sunrise", "nature"],
  );

  const toggleTravelTaste = (taste: string) => {
    setSelectedTravelTastes((prev) =>
      prev.includes(taste) ? prev.filter((t) => t !== taste) : [...prev, taste],
    );
  };

  const toggleExpTaste = (taste: string) => {
    setSelectedExpTastes((prev) =>
      prev.includes(taste) ? prev.filter((t) => t !== taste) : [...prev, taste],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mustVisit = defaultMustVisitId
      ? Array.from(new Set([...(request.mustVisitPlaceIds || []), defaultMustVisitId]))
      : request.mustVisitPlaceIds;

    const payload = {
      country: "India",
      regionId: "region_west_bengal",
      destinationId: "dest_darjeeling",
      travelTaste: selectedTravelTastes,
      experienceTaste: selectedExpTastes,
      dayNight,
      preferredStartTime: startTime,
      preferredEndTime: endTime,
      durationDays,
      pace,
      mustVisitPlaceIds: mustVisit,
    };

    setRequest(payload);
    await generateItinerary(payload);
    if (onGenerated) onGenerated();
  };

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="border-offbeat-border bg-offbeat-surface/90 backdrop-blur-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-offbeat-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-offbeat-accent" />
              <span className="text-xs font-mono font-bold tracking-widest text-offbeat-accent uppercase">
                Itinerary Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-offbeat-primary tracking-tight">
              Build Your OFFBEAT Day
            </h2>
          </div>
          <Badge variant="verified" size="sm" className="self-start sm:self-auto">
            <Sparkles className="h-3 w-3 mr-1 inline" /> Multi-Signal Optimized
          </Badge>
        </div>

        {/* Location & Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-offbeat-muted uppercase tracking-wider mb-1.5">
              Destination
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-offbeat-dark border border-offbeat-border">
              <MapPin className="h-4 w-4 text-offbeat-accent shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent text-sm text-offbeat-primary focus:outline-none w-full"
                placeholder="e.g. Darjeeling, West Bengal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-offbeat-muted uppercase tracking-wider mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDurationDays(1)}
                className={cn(
                  "p-2.5 rounded-lg border text-xs font-bold transition-all text-center",
                  durationDays === 1
                    ? "bg-offbeat-accent/15 border-offbeat-accent text-offbeat-accent"
                    : "bg-offbeat-dark border-offbeat-border text-offbeat-secondary hover:border-offbeat-border/80",
                )}
              >
                Day Trip (1 Day)
              </button>
              <button
                type="button"
                onClick={() => setDurationDays(2)}
                className={cn(
                  "p-2.5 rounded-lg border text-xs font-bold transition-all text-center",
                  durationDays === 2
                    ? "bg-offbeat-accent/15 border-offbeat-accent text-offbeat-accent"
                    : "bg-offbeat-dark border-offbeat-border text-offbeat-secondary hover:border-offbeat-border/80",
                )}
              >
                2 Days
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-offbeat-muted uppercase tracking-wider mb-1.5">
              Day / Night Focus
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["DAY", "NIGHT", "ANY"] as const).map((dn) => (
                <button
                  key={dn}
                  type="button"
                  onClick={() => setDayNight(dn)}
                  className={cn(
                    "p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1",
                    dayNight === dn
                      ? "bg-offbeat-accent/15 border-offbeat-accent text-offbeat-accent"
                      : "bg-offbeat-dark border-offbeat-border text-offbeat-secondary hover:border-offbeat-border/80",
                  )}
                >
                  {dn === "DAY" && <Sun className="h-3 w-3" />}
                  {dn === "NIGHT" && <Moon className="h-3 w-3" />}
                  {dn === "ANY" && <Compass className="h-3 w-3" />}
                  <span>{dn}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Time Window & Pace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-offbeat-muted uppercase tracking-wider mb-1.5">
              Active Hours
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-offbeat-dark border border-offbeat-border">
                <Clock className="h-3.5 w-3.5 text-offbeat-muted shrink-0" />
                <span className="text-xs text-offbeat-muted">Start:</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-transparent text-xs text-offbeat-primary focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-offbeat-dark border border-offbeat-border">
                <Clock className="h-3.5 w-3.5 text-offbeat-muted shrink-0" />
                <span className="text-xs text-offbeat-muted">End:</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-transparent text-xs text-offbeat-primary focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-offbeat-muted uppercase tracking-wider mb-1.5">
              Pacing
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPace("RELAXED")}
                className={cn(
                  "p-2 rounded-lg border text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5",
                  pace === "RELAXED"
                    ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-300"
                    : "bg-offbeat-dark border-offbeat-border text-offbeat-secondary hover:border-offbeat-border/80",
                )}
              >
                <Coffee className="h-3.5 w-3.5" />
                <span>Relaxed</span>
                <span className="text-[10px] font-normal opacity-70">Fewer stops</span>
              </button>
              <button
                type="button"
                onClick={() => setPace("BALANCED")}
                className={cn(
                  "p-2 rounded-lg border text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5",
                  pace === "BALANCED"
                    ? "bg-offbeat-accent/15 border-offbeat-accent text-offbeat-accent"
                    : "bg-offbeat-dark border-offbeat-border text-offbeat-secondary hover:border-offbeat-border/80",
                )}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Balanced</span>
                <span className="text-[10px] font-normal opacity-70">Signature mix</span>
              </button>
              <button
                type="button"
                onClick={() => setPace("PACKED")}
                className={cn(
                  "p-2 rounded-lg border text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5",
                  pace === "PACKED"
                    ? "bg-amber-500/15 border-amber-500/60 text-amber-300"
                    : "bg-offbeat-dark border-offbeat-border text-offbeat-secondary hover:border-offbeat-border/80",
                )}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Packed</span>
                <span className="text-[10px] font-normal opacity-70">Max highlights</span>
              </button>
            </div>
          </div>
        </div>

        {/* Travel Taste Chips */}
        <div>
          <label className="block text-xs font-bold text-offbeat-muted uppercase tracking-wider mb-2">
            Travel Style & Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTravelTastes.map((taste) => {
              const active = selectedTravelTastes.includes(taste);
              return (
                <button
                  key={taste}
                  type="button"
                  onClick={() => toggleTravelTaste(taste)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border",
                    active
                      ? "bg-offbeat-accent/20 border-offbeat-accent text-offbeat-accent shadow-sm"
                      : "bg-offbeat-dark/70 border-offbeat-border/80 text-offbeat-secondary hover:border-offbeat-border",
                  )}
                >
                  {taste}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Taste Chips */}
        <div>
          <label className="block text-xs font-bold text-offbeat-muted uppercase tracking-wider mb-2">
            Desired Experiences
          </label>
          <div className="flex flex-wrap gap-2">
            {availableExpTastes.map((taste) => {
              const active = selectedExpTastes.includes(taste);
              return (
                <button
                  key={taste}
                  type="button"
                  onClick={() => toggleExpTaste(taste)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border",
                    active
                      ? "bg-amber-400/20 border-amber-400/80 text-amber-300 shadow-sm"
                      : "bg-offbeat-dark/70 border-offbeat-border/80 text-offbeat-secondary hover:border-offbeat-border",
                  )}
                >
                  {taste}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center text-sm font-bold tracking-wide py-3.5"
            disabled={loading}
            leftIcon={
              loading ? (
                <div className="h-4 w-4 border-2 border-offbeat-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )
            }
            rightIcon={!loading ? <ChevronRight className="h-4 w-4" /> : undefined}
          >
            {loading ? "GENERATING SMART ITINERARY..." : "GENERATE MY ITINERARY"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
