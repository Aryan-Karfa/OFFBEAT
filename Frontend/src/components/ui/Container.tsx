import React, { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container: React.FC<ContainerProps> = ({
  size = "lg",
  className,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-[90rem]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeStyles[size], className)}
      {...props}
    >
      {children}
    </div>
  );
};
