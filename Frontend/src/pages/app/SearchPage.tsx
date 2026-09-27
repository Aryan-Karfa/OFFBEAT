import React, { useState } from "react";
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
import { Input } from "../../components/ui/Input";
import {
  SearchIcon,
  MapPinIcon,
  SlidersIcon,
  CompassIcon,
  SparklesIcon,
} from "../../components/icons/Icons";

export const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const filterTags = [
    { id: "all", label: "All Tastes" },
    { id: "isolation", label: "Quiet & Isolation" },
    { id: "culinary", label: "Culinary Heritage" },
    { id: "wilderness", label: "Wilderness & Trails" },
    { id: "cultural", label: "Hidden Cultural" },
    { id: "coastal", label: "Coastal Havens" },
  ];

  const searchResults = [
    {
      id: "res-1",
      title: "Valle de Ricote Palm Oases",
      region: "Murcia, Spain",
      tag: "isolation",
      tagName: "Quiet & Isolation",
      badgeVariant: "accent" as const,
      description:
        "A hidden Moorish valley of fruit orchards, date palms, and thermal springs untainted by mass resort tourism.",
      highlights: ["Thermal Baths", "Ancient Waterwheels", "Mountain Terraces"],
    },
    {
      id: "res-2",
      title: "Seto Inland Sea Art Archipelago",
      region: "Kagawa & Okayama, Japan",
      tag: "cultural",
      tagName: "Hidden Cultural",
      badgeVariant: "gold" as const,
      description:
        "Quiet island hamlets converted into low-density architectural and artistic sanctuaries with local ferry transit.",
      highlights: ["Minimalist Architecture", "Quiet Fishing Ports", "Citrus Groves"],
    },
    {
      id: "res-3",
      title: "Dingle Peninsula Outer Headlands",
      region: "County Kerry, Ireland",
      tag: "coastal",
      tagName: "Coastal Havens",
      badgeVariant: "success" as const,
      description:
        "Wind-carved Atlantic sea cliffs, Gaelic-speaking hamlets, and solitary prehistoric stone beehive huts.",
      highlights: ["Dramatic Bluffs", "Traditional Music Sessions", "Wild Coasts"],
    },
    {
      id: "res-4",
      title: "Picos de Europa Limestone Gorges",
      region: "Asturias & León, Spain",
      tag: "wilderness",
      tagName: "Wilderness & Trails",
      badgeVariant: "neutral" as const,
      description:
        "Towering karst peaks, deep river ravines, and mountain shepherd villages famous for cave-ripened blue cheeses.",
      highlights: ["Cares Gorge", "Remote Refugios", "Alpine Meadows"],
    },
  ];

  const filteredResults = searchResults.filter((item) => {
    const matchesTag = selectedTag === "all" || item.tag === selectedTag;
    const matchesQuery =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Search & Explore"
        description="Search destinations and experiences filtered by travel taste rather than generic tourist popularity."
        badge={
          <Badge variant="accent" size="sm">
            Phase 1 UI Foundation
          </Badge>
        }
      />

      {/* Search Input Bar & Taste Filter Chips */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              id="search-input"
              type="text"
              placeholder="Search by destination, region, or experience keyword (e.g. Kyoto, Coastal, Thermal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={<SearchIcon size={18} />}
              className="h-11 bg-[#12161f]"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<SlidersIcon size={16} />}
            className="w-full sm:w-auto shrink-0"
          >
            Filters
          </Button>
        </div>

        {/* Taste Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 font-mono text-[11px] uppercase tracking-wider">
            Taste Filters:
          </span>
          {filterTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTag(tag.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 ${
                selectedTag === tag.id
                  ? "bg-[#ff5a36] text-white font-medium shadow-glow-accent"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredResults.length} discovery concepts
          </span>
          <span className="text-xs text-slate-400">
            Phase 1: Mock discovery index (SerpApi & Gemini in future phases)
          </span>
        </div>

        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredResults.map((result) => (
              <Card
                key={result.id}
                className="border-[#1f2633] bg-[#12161f]/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={result.badgeVariant} size="sm">
                      {result.tagName}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <MapPinIcon size={13} className="text-slate-400" />
                      <span>{result.region}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white font-semibold">
                    {result.title}
                  </CardTitle>
                  <CardDescription className="pt-2 text-sm">
                    {result.description}
                  </CardDescription>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {result.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-800/60 text-slate-300 border border-slate-700/40"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 border-t border-[#1f2633]/60 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <CompassIcon size={14} className="text-[#ff5a36]" />
                    <span>Offbeat Score: 94%</span>
                  </span>
                  <Button variant="ghost" size="sm" className="text-xs text-[#ff5a36]">
                    Details Preview
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-[#1f2633] bg-[#12161f]/40 p-12 text-center">
            <div className="max-w-xs mx-auto space-y-3">
              <SearchIcon size={28} className="mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">
                No matching spots found
              </div>
              <p className="text-xs text-slate-400">
                Try selecting &apos;All Tastes&apos; or changing your search keyword.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTag("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Discovery Prompt Banner */}
      <Card className="border-[#1f2633] bg-gradient-to-r from-orange-500/10 via-[#12161f] to-[#12161f]">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <SparklesIcon size={16} className="text-[#ff5a36]" />
              <span>Taste-Driven Exploration</span>
            </div>
            <p className="text-xs text-slate-400">
              In Phase 3 and Phase 4, natural-language exploration prompts powered by Gemini and
              SerpApi will dynamically suggest offbeat alternatives.
            </p>
          </div>
          <Badge variant="accent" size="sm">
            Phase 1 Ready
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
