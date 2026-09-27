import React, { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  bordered?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  spacing = "lg",
  bordered = false,
  className,
  children,
  ...props
}) => {
  const spacingStyles = {
    none: "py-0",
    sm: "py-8 sm:py-12",
    md: "py-12 sm:py-16",
    lg: "py-16 sm:py-24",
    xl: "py-20 sm:py-32",
  };

  return (
    <section
      className={cn(
        "relative w-full",
        spacingStyles[spacing],
        bordered && "border-b border-offbeat-border",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
};
