import React, { useState } from "react";
import { ShieldCheck, Trash2, AlertTriangle, Lock, Eye } from "lucide-react";

interface MemorySettingsProps {
  memoryEnabled: boolean;
  totalMemories: number;
  onToggleEnabled: (enabled: boolean) => void;
  onClearAll: () => void;
}

export const MemorySettings: React.FC<MemorySettingsProps> = ({
  memoryEnabled,
  totalMemories,
  onToggleEnabled,
  onClearAll,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="rounded-3xl bg-offbeat-surface border border-offbeat-border p-6 md:p-8 mb-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-offbeat-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono uppercase tracking-widest text-offbeat-muted flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              PRIVACY & CONTROL
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-1">OFFBEAT Traveler Memory</h3>
          <p className="text-xs md:text-sm text-offbeat-secondary max-w-xl">
            OFFBEAT learns your travel style so recommendations, itineraries, and local finds become
            more relevant over time. You are always in control of what is stored.
          </p>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-white">
            {memoryEnabled ? "Memory Active" : "Memory Paused"}
          </span>
          <button
            type="button"
            onClick={() => onToggleEnabled(!memoryEnabled)}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              memoryEnabled ? "bg-amber-500" : "bg-offbeat-border"
            }`}
            role="switch"
            aria-checked={memoryEnabled}
            aria-label="Toggle traveler memory"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                memoryEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Transparent Boundaries Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider font-mono">
            <Eye className="w-4 h-4" />
            What OFFBEAT Remembers
          </div>
          <ul className="text-xs text-offbeat-secondary space-y-1.5 list-disc list-inside">
            <li>Saved travel styles (mountains, wildlife, heritage)</li>
            <li>Experience preferences (sunrise, scenic trails, food)</li>
            <li>Pace preferences (relaxed, balanced, packed)</li>
            <li>Frequently chosen alternative stop modes</li>
            <li>Local take-home craft and culinary affinities</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-slate-500/5 border border-slate-500/20">
          <div className="flex items-center gap-2 mb-2 text-offbeat-muted font-semibold text-xs uppercase tracking-wider font-mono">
            <Lock className="w-4 h-4 text-offbeat-muted" />
            What OFFBEAT Never Remembers
          </div>
          <ul className="text-xs text-offbeat-secondary space-y-1.5 list-disc list-inside">
            <li>No medical, health, or fitness data</li>
            <li>No political opinions or voting preferences</li>
            <li>No religious beliefs or personal creed</li>
            <li>No financial details, income, or transaction history</li>
            <li>No full background tracking or surveillance logs</li>
          </ul>
        </div>
      </div>

      {/* Danger Zone: Clear All */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-offbeat-border/50">
        <div className="text-xs text-offbeat-muted">
          Currently holding <strong className="text-white">{totalMemories}</strong> remembered
          signals.
        </div>

        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          disabled={totalMemories === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All Memory
        </button>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-offbeat-surface border border-red-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-lg font-bold text-white">Clear All Traveler Memory?</h4>
            </div>
            <p className="text-xs text-offbeat-secondary leading-relaxed mb-6">
              This will permanently delete all {totalMemories} remembered travel signals. Your
              current journey session will remain active, but future discovery will reset to
              standard unpersonalized suggestions until you explore again.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-offbeat-secondary hover:text-white hover:bg-offbeat-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
