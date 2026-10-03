import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface DiscoveryEmptyProps {
  regionName?: string;
  onReset?: () => void;
}

export const DiscoveryEmpty: React.FC<DiscoveryEmptyProps> = ({
  regionName = "this region",
  onReset,
}) => {
  return (
    <div className="w-full py-16 px-4 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="h-16 w-16 rounded-2xl bg-offbeat-dark border border-offbeat-border flex items-center justify-center text-offbeat-muted mb-6 shadow-md">
        <Compass className="h-8 w-8 text-offbeat-muted/70" />
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-offbeat-accent block mb-2">
        0 Discoveries Matching Selected Nuances
      </span>

      <h3 className="font-display text-2xl font-bold text-offbeat-primary mb-3">
        No Strong Matches Found in {regionName}
      </h3>

      <p className="text-sm text-offbeat-secondary mb-8 leading-relaxed">
        Your current combination of travel tastes and experience nuances is very specific. Try
        broadening your experience preferences or exploring a nearby destination.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/experience-taste">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Refine Preferences
          </Button>
        </Link>

        {onReset && (
          <Button
            variant="secondary"
            size="md"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Reset Filters
          </Button>
        )}

        <Link to="/country/india/map">
          <Button variant="ghost" size="md">
            Explore Other Regions
          </Button>
        </Link>
      </div>
    </div>
  );
};
