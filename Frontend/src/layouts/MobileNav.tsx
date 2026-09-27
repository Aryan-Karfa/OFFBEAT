import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, MapPin, Users, User } from "lucide-react";
import { cn } from "../utils/cn";

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const items = [
    { label: "Discover", href: "/country", icon: Compass },
    { label: "Trips", href: "/itinerary", icon: MapPin },
    { label: "Community", href: "/community", icon: Users },
    { label: "Me", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/country") {
      return (
        location.pathname.startsWith("/country") ||
        location.pathname.startsWith("/map") ||
        location.pathname === "/"
      );
    }
    return location.pathname === href;
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-offbeat-border bg-offbeat-surface/95 backdrop-blur-lg"
    >
      <div className="grid h-16 grid-cols-4 items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 transition-colors select-none",
                active ? "text-offbeat-accent" : "text-offbeat-muted hover:text-offbeat-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
