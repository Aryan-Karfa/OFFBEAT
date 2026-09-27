import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 cursor-pointer select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent focus-visible:ring-offset-2 focus-visible:ring-offset-offbeat-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-semibold tracking-wider",
    };

    const variantStyles = {
      primary:
        "bg-offbeat-accent text-offbeat-dark hover:bg-offbeat-accent-hover shadow-card hover:shadow-glow font-semibold",
      secondary:
        "bg-offbeat-surface text-offbeat-primary border border-offbeat-border hover:bg-offbeat-elevated hover:border-offbeat-muted/40",
      accent:
        "bg-offbeat-elevated text-offbeat-accent border border-offbeat-accent/40 hover:bg-offbeat-accent/10 hover:border-offbeat-accent",
      outline:
        "bg-transparent text-offbeat-primary border border-offbeat-border hover:bg-offbeat-surface hover:border-offbeat-secondary/40",
      ghost:
        "bg-transparent text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface/60",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
