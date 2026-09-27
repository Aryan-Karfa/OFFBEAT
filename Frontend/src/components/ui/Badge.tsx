import React, { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "verified" | "supported" | "new" | "flagged" | "tag" | "accent" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "tag",
  size = "sm",
  dot = false,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium tracking-wide rounded-full select-none";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 gap-1.5",
    md: "text-sm px-3.5 py-1 gap-2",
  };

  const variantStyles = {
    verified:
      "bg-confidence-verified/10 text-confidence-verified border border-confidence-verified/30",
    supported:
      "bg-confidence-supported/10 text-confidence-supported border border-confidence-supported/30",
    new: "bg-confidence-new/10 text-offbeat-secondary border border-confidence-new/20",
    flagged: "bg-confidence-flagged/10 text-confidence-flagged border border-confidence-flagged/30",
    accent:
      "bg-offbeat-accent/15 text-offbeat-accent border border-offbeat-accent/30 font-semibold",
    tag: "bg-offbeat-surface text-offbeat-secondary border border-offbeat-border hover:border-offbeat-secondary/40 transition-colors",
    outline: "bg-transparent text-offbeat-secondary border border-offbeat-border",
  };

  const dotColors = {
    verified: "bg-confidence-verified",
    supported: "bg-confidence-supported",
    new: "bg-confidence-new",
    flagged: "bg-confidence-flagged",
    accent: "bg-offbeat-accent",
    tag: "bg-offbeat-muted",
    outline: "bg-offbeat-muted",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
