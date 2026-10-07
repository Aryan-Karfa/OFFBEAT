import React from "react";
import type { TakeHomeItemDto } from "@offbeat/shared";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { X, Shuffle, ArrowRight, Sparkles } from "lucide-react";

interface TakeHomeAlternativesModalProps {
  item: TakeHomeItemDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative?: (altId: string) => void;
}

export const TakeHomeAlternativesModal: React.FC<TakeHomeAlternativesModalProps> = ({
  item,
  isOpen,
  onClose,
  onSelectAlternative,
}) => {
  if (!isOpen || !item) return null;

  const alternatives = item.alternatives || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-offbeat-surface border border-offbeat-border p-6 md:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-offbeat-surface-hover text-offbeat-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="accent" size="sm">
              <Shuffle className="w-3 h-3 mr-1" />
              Alternative Finds
            </Badge>
            <span className="text-xs text-offbeat-muted font-mono uppercase">
              Phase 12 Architecture
            </span>
          </div>

          <Heading level={2} size="h3" className="text-xl md:text-2xl font-bold text-white mb-2">
            Alternatives to: <span className="text-amber-400">{item.name}</span>
          </Heading>
          <Text variant="muted" className="text-xs">
            Looking for something lighter, longer-lasting, or a different local taste?
          </Text>
        </div>

        {/* Alternatives List */}
        {alternatives.length > 0 ? (
          <div className="space-y-4 mb-6">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="p-5 rounded-2xl bg-offbeat-surface-hover/70 border border-offbeat-border/80 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-white text-base">{alt.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-offbeat-surface text-amber-300 border border-offbeat-border uppercase">
                      {alt.category.replace(/_/g, " ")}
                    </span>
                  </div>

                  <Text variant="body" className="text-xs leading-relaxed text-offbeat-secondary">
                    {alt.why}
                  </Text>
                </div>

                {onSelectAlternative && (
                  <button
                    onClick={() => {
                      onSelectAlternative(alt.id);
                      onClose();
                    }}
                    className="self-end flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors pt-1"
                  >
                    <span>View this specialty</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-offbeat-surface-hover/40 border border-dashed border-offbeat-border text-center mb-6">
            <Sparkles className="w-8 h-8 text-offbeat-muted mx-auto mb-2 opacity-60" />
            <Text className="text-sm font-medium text-white mb-1">Signature Standalone</Text>
            <Text variant="muted" className="text-xs">
              No direct alternative found. This specialty is distinctly unique to the local region.
            </Text>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-offbeat-surface hover:bg-offbeat-surface-hover text-white text-xs font-semibold border border-offbeat-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
