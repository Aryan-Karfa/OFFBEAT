import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  LibraryIcon,
  MapPinIcon,
  SearchIcon,
  SparklesIcon,
} from "../../components/icons/Icons";

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "curated" | "wishlist">("all");

  const libraryCollections = [
    {
      id: "col-1",
      title: "Alpine Hideaways & High Passes",
      category: "curated",
      count: 6,
      region: "Valais & Graubünden, Switzerland",
      tag: "Mountain Isolation",
      badgeVariant: "accent" as const,
      updated: "Recently saved",
    },
    {
      id: "col-2",
      title: "Cantabrian Coastline Seafood Havens",
      category: "wishlist",
      count: 4,
      region: "Asturias & Cantabria, Spain",
      tag: "Culinary & Ocean",
      badgeVariant: "gold" as const,
      updated: "Saved this week",
    },
    {
      id: "col-3",
      title: "Kyoto Tea Master Roasteries",
      category: "curated",
      count: 3,
      region: "Uji & Kyoto, Japan",
      tag: "Cultural Heritage",
      badgeVariant: "success" as const,
      updated: "Saved earlier",
    },
  ];

  const filtered =
    activeTab === "all"
      ? libraryCollections
      : libraryCollections.filter((c) => c.category === activeTab);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Saved Library"
        description="Your personal repository of offbeat spots, regional collections, and discovered travel alternatives."
        badge={
          <Badge variant="neutral" size="sm">
            Phase 1 UI Foundation
          </Badge>
        }
        actions={
          <Link to="/search">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<SearchIcon size={14} />}
            >
              Explore New Spots
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f2633] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "all"
              ? "bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          All Collections ({libraryCollections.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("curated")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "curated"
              ? "bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Curated Lists
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("wishlist")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "wishlist"
              ? "bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Wishlist
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className="border-[#1f2633] bg-[#12161f]/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <CardHeader className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={item.badgeVariant} size="sm">
                  {item.tag}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {item.count} places
                </span>
              </div>
              <CardTitle className="text-base text-white font-semibold">
                {item.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-2">
                <MapPinIcon size={14} className="text-slate-400 shrink-0" />
                <span>{item.region}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 border-t border-[#1f2633]/60 mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{item.updated}</span>
              <span className="text-slate-400 font-sans text-xs">Preview</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State / Callout */}
      <Card className="border-[#1f2633] bg-[#12161f]/40 border-dashed text-center p-8">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-[#ff5a36]">
            <LibraryIcon size={24} />
          </div>
          <h3 className="text-base font-semibold text-white">
            Library Storage Initialized
          </h3>
          <p className="text-xs text-slate-400">
            Saved items and custom itineraries will persist to your profile in later phases.
            Explore destinations to test navigation and layouts.
          </p>
          <div className="pt-2">
            <Link to="/search">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<SparklesIcon size={14} />}
              >
                Discover Places to Save
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
