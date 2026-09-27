import React, { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: "body" | "lead" | "muted" | "small" | "caption" | "accent";
  as?: "p" | "span" | "div";
}

export const Text: React.FC<TextProps> = ({
  variant = "body",
  as: Component = "p",
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    body: "text-base text-offbeat-primary/90 leading-relaxed",
    lead: "text-lg sm:text-xl text-offbeat-secondary leading-relaxed font-normal",
    muted: "text-sm text-offbeat-muted leading-normal",
    small: "text-xs sm:text-sm text-offbeat-secondary leading-normal",
    caption: "text-xs text-offbeat-muted tracking-wide uppercase",
    accent: "text-sm font-medium text-offbeat-accent",
  };

  return (
    <Component className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </Component>
  );
};
