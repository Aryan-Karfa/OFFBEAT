import React from "react";
import type { EvidenceStrength } from "@offbeat/shared";

interface EvidenceStrengthBadgeProps {
  strength: EvidenceStrength;
  score?: number;
  className?: string;
  showScore?: boolean;
}

export const EvidenceStrengthBadge: React.FC<EvidenceStrengthBadgeProps> = ({
  strength,
  score,
  className = "",
  showScore = false,
}) => {
  let label: string;
  let color: string;
  let dotColor: string;

  switch (strength) {
    case "HIGH":
      label = "High Evidence";
      color = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
      dotColor = "bg-emerald-400";
      break;
    case "MODERATE":
      label = "Moderate Evidence";
      color = "text-sky-400 bg-sky-950/40 border-sky-800/40";
      dotColor = "bg-sky-400";
      break;
    case "CONTESTED":
      label = "Contested Evidence";
      color = "text-amber-400 bg-amber-950/40 border-amber-800/40";
      dotColor = "bg-amber-400";
      break;
    case "EMERGING":
    default:
      label = "Emerging Evidence";
      color = "text-slate-400 bg-slate-800/60 border-slate-700/50";
      dotColor = "bg-slate-400";
      break;
  }

  const scoreText = showScore && typeof score === "number" ? ` (${Math.round(score * 100)}%)` : "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md border ${color} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>
        {label}
        {scoreText}
      </span>
    </span>
  );
};
