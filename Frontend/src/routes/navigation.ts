export interface NavItem {
  id: string;
  name: string;
  href: string;
  description: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    description: "Discovery overview & curated tastes",
  },
  {
    id: "library",
    name: "Library",
    href: "/library",
    description: "Saved collections & places",
  },
  {
    id: "search",
    name: "Search",
    href: "/search",
    description: "Explore destinations & spots",
  },
  {
    id: "profile",
    name: "Profile",
    href: "/profile",
    description: "Traveler taste & preferences",
  },
  {
    id: "settings",
    name: "Settings",
    href: "/settings",
    description: "Preferences & system info",
  },
];
