import React from "react";
import { Link } from "react-router-dom";
import type { PlaceReference, AlternativeMode } from "@offbeat/shared";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { MapPin, ArrowLeft, Lightbulb, Compass, PlusCircle, Layers, Sparkles } from "lucide-react";

interface OriginalPlaceBannerProps {
  originalPlace: PlaceReference;
  mode: AlternativeMode;
  primaryAlternativeName?: string;
}

export const OriginalPlaceBanner: React.FC<OriginalPlaceBannerProps> = ({
  originalPlace,
  mode,
  primaryAlternativeName,
}) => {
  const getStrategyAdvice = () => {
    switch (mode) {
      case "ENHANCEMENT":
        return primaryAlternativeName
          ? `Keep ${originalPlace.name}. Add ${primaryAlternativeName} nearby to elevate your journey.`
          : `Keep ${originalPlace.name}. Here is how to make the experience even better.`;
      case "COMPLEMENTARY":
        return primaryAlternativeName
          ? `Experience ${originalPlace.name}, then balance it with ${primaryAlternativeName} for cultural contrast.`
          : `Pair ${originalPlace.name} with a diverse complementary counterpart in the same area.`;
      case "LOWER_CROWD":
        return `Seeking tranquility? Discover calmer, low-density counterparts to ${originalPlace.name}.`;
      case "TIMING_ALTERNATIVE":
        return `Explore better daylight, sunrise, or golden-hour timing windows around ${originalPlace.name}.`;
      case "NEARBY_DISCOVERY":
        return `Uncover local hidden gems and lesser-known corners nestled close to ${originalPlace.name}.`;
      case "REPLACEMENT":
      default:
        return `Exploring true substitutes with similar character and atmosphere to ${originalPlace.name}.`;
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "ENHANCEMENT":
        return <PlusCircle className="h-4 w-4 text-emerald-400" />;
      case "COMPLEMENTARY":
        return <Layers className="h-4 w-4 text-blue-400" />;
      case "NEARBY_DISCOVERY":
        return <Compass className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-offbeat-accent" />;
    }
  };

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="border-offbeat-accent/30 bg-gradient-to-r from-offbeat-surface via-offbeat-surface/90 to-offbeat-dark mb-8 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-offbeat-muted">
              You were considering
            </span>
            <Badge variant="accent" size="sm">
              ORIGINAL STOP
            </Badge>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-offbeat-primary tracking-tight">
              {originalPlace.name}
            </h1>
            {originalPlace.destination && (
              <span className="inline-flex items-center gap-1 text-xs text-offbeat-accent font-medium">
                <MapPin className="h-3.5 w-3.5" /> {originalPlace.destination}
              </span>
            )}
          </div>

          {/* Contextual Pairing Guidance */}
          <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm font-medium text-offbeat-secondary bg-offbeat-dark/60 border border-offbeat-border/80 px-3.5 py-2 rounded-lg max-w-2xl">
            {getModeIcon()}
            <span>{getStrategyAdvice()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 self-start md:self-center">
          <Link
            to={`/place/${originalPlace.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-offbeat-dark border border-offbeat-border text-offbeat-secondary hover:text-offbeat-primary hover:border-offbeat-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Place Details
          </Link>
        </div>
      </div>
    </Card>
  );
};
