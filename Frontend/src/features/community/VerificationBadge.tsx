import React from "react";
import type { VerificationStatus } from "@offbeat/shared";

interface VerificationBadgeProps {
  status: VerificationStatus;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  onClick,
  className = "",
  size = "md",
}) => {
  const isClickable = Boolean(onClick);

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs gap-1.5";

  let colorClasses: string;
  let icon: string;
  let label: string;

  switch (status) {
    case "COMMUNITY_VERIFIED":
      colorClasses =
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25";
      icon = "✓";
      label = "Community Verified";
      break;
    case "COMMUNITY_SUPPORTED":
      colorClasses = "bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25";
      icon = "★";
      label = "Community Supported";
      break;
    case "FLAGGED":
      colorClasses = "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25";
      icon = "⚠";
      label = "Contested / Under Review";
      break;
    case "REJECTED":
      colorClasses = "bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25";
      icon = "✕";
      label = "Rejected";
      break;
    case "PENDING":
    default:
      colorClasses = "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800";
      icon = "◷";
      label = "Emerging Tip";
      break;
  }

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={onClick}
      className={`inline-flex items-center font-medium rounded-full border transition-all ${sizeClasses} ${colorClasses} ${
        isClickable ? "cursor-pointer active:scale-95" : "cursor-default"
      } ${className}`}
      title={isClickable ? "Click to view evidence strength breakdown" : undefined}
    >
      <span className="font-bold">{icon}</span>
      <span>{label}</span>
      {isClickable && <span className="text-[10px] opacity-60 ml-0.5">ℹ</span>}
    </button>
  );
};
