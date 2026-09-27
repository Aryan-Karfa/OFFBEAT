import React, { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const baseStyles = "rounded-xl transition-all duration-200";

    const variantStyles = {
      default: "bg-offbeat-surface border border-offbeat-border shadow-card",
      elevated: "bg-offbeat-elevated border border-offbeat-border/80 shadow-elevated",
      interactive:
        "bg-offbeat-surface border border-offbeat-border shadow-card hover:bg-offbeat-elevated hover:border-offbeat-accent/50 hover:shadow-card-hover cursor-pointer group",
      flat: "bg-offbeat-surface/40 border border-offbeat-border/50",
    };

    const paddingStyles = {
      none: "p-0",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
