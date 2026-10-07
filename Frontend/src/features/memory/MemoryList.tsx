import React, { useState } from "react";
import type { TravelerMemoryDto } from "@offbeat/shared";
import { MemoryItem } from "./MemoryItem";
import { Search, Brain } from "lucide-react";

interface MemoryListProps {
  memories: TravelerMemoryDto[];
  onRemove: (id: string) => void;
}

export const MemoryList: React.FC<MemoryListProps> = ({ memories, onRemove }) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPLICIT" | "INFERRED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const explicitMemories = memories.filter((m) => m.source === "EXPLICIT");
  const inferredMemories = memories.filter((m) => m.source !== "EXPLICIT");

  const displayedMemories = (
    activeTab === "EXPLICIT"
      ? explicitMemories
      : activeTab === "INFERRED"
        ? inferredMemories
        : memories
  ).filter((m) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      m.value.toLowerCase().includes(term) ||
      m.key.toLowerCase().includes(term) ||
      m.type.toLowerCase().includes(term) ||
      (m.explanation && m.explanation.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-offbeat-surface border border-offbeat-border rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "ALL"
                ? "bg-offbeat-accent text-white shadow-sm"
                : "text-offbeat-muted hover:text-white"
            }`}
          >
            All ({memories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EXPLICIT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "EXPLICIT"
                ? "bg-offbeat-accent text-white shadow-sm"
                : "text-offbeat-muted hover:text-white"
            }`}
          >
            You Told OFFBEAT ({explicitMemories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INFERRED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "INFERRED"
                ? "bg-offbeat-accent text-white shadow-sm"
                : "text-offbeat-muted hover:text-white"
            }`}
          >
            OFFBEAT Noticed ({inferredMemories.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-offbeat-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter memories..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-offbeat-surface border border-offbeat-border text-white placeholder-offbeat-muted focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      {/* Grid of Memories */}
      {displayedMemories.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-offbeat-surface/50 border border-dashed border-offbeat-border">
          <Brain className="w-8 h-8 text-offbeat-muted mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-semibold text-white mb-1">No memories found</h4>
          <p className="text-xs text-offbeat-secondary max-w-sm mx-auto">
            {searchQuery
              ? `No signals matched "${searchQuery}". Try a different filter.`
              : "As you explore places, generate itineraries, and choose local finds, OFFBEAT will remember your travel preferences."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMemories.map((mem) => (
            <MemoryItem key={mem.id} memory={mem} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
};
