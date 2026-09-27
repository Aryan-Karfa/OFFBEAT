import React from "react";
import { cn } from "../../lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-8 border-b border-[#1f2633]/80",
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
          {badge}
        </div>
        {description && <p className="text-sm text-slate-400 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 self-start md:self-auto">{actions}</div>}
    </div>
  );
};
