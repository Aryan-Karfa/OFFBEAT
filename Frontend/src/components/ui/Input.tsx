import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, startIcon, endIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-500">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-[#12161f]/90 text-slate-100 text-sm placeholder:text-slate-500 rounded-lg border border-[#1f2633] px-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus:border-[#ff5a36] focus:ring-1 focus:ring-[#ff5a36] disabled:opacity-50 disabled:cursor-not-allowed",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 flex items-center text-slate-500">{endIcon}</div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
