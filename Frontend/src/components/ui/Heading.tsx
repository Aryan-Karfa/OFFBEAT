import React, { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "display" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  as,
  size,
  className,
  children,
  ...props
}) => {
  const Component = as || (`h${level}` as const);
  const effectiveSize = size || (`h${level}` as const);

  const sizeStyles = {
    display:
      "font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-offbeat-primary leading-[1.08]",
    h1: "font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-offbeat-primary leading-tight",
    h2: "font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-offbeat-primary leading-snug",
    h3: "font-display text-xl sm:text-2xl font-semibold tracking-tight text-offbeat-primary",
    h4: "font-sans text-lg sm:text-xl font-semibold text-offbeat-primary",
    h5: "font-sans text-base font-semibold text-offbeat-primary uppercase tracking-wider",
    h6: "font-sans text-sm font-semibold text-offbeat-secondary uppercase tracking-widest",
  };

  return (
    <Component className={cn(sizeStyles[effectiveSize], className)} {...props}>
      {children}
    </Component>
  );
};
