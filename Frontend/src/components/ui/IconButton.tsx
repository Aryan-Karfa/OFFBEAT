import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "ghost",
      size = "md",
      type = "button",
      "aria-label": ariaLabel,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent disabled:opacity-50 disabled:pointer-events-none";

    const sizeStyles = {
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
    };

    const variantStyles = {
      primary: "bg-offbeat-accent text-offbeat-dark hover:bg-offbeat-accent-hover shadow-card",
      secondary:
        "bg-offbeat-surface text-offbeat-primary border border-offbeat-border hover:bg-offbeat-elevated",
      ghost: "text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface/60",
      outline:
        "border border-offbeat-border text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface",
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
