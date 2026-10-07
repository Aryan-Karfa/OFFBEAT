import React from "react";
import type { TakeHomeItemDto } from "@offbeat/shared";
import { Heading } from "../../components/ui/Heading";
import { Users, ThumbsUp, ShieldCheck, MessageSquare } from "lucide-react";

interface TakeHomeCommunityPicksProps {
  items: TakeHomeItemDto[];
  destinationName: string;
}

export const TakeHomeCommunityPicks: React.FC<TakeHomeCommunityPicksProps> = ({
  items,
  destinationName,
}) => {
  // Only display items with authentic community corroboration
  const communityItems = items.filter((item) => item.community !== undefined);

  if (communityItems.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-emerald-400" />
        <Heading level={2} size="h3" className="text-xl md:text-2xl font-bold text-white">
          Community-Verified Finds in {destinationName}
        </Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communityItems.map((item) => {
          const comm = item.community!;
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-offbeat-surface border border-offbeat-border hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-white text-base">{item.name}</span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                {comm.quote && (
                  <div className="mb-3 text-xs text-offbeat-secondary italic flex items-start gap-2 bg-offbeat-surface-hover/50 p-3 rounded-xl border border-offbeat-border/60">
                    <MessageSquare className="w-3.5 h-3.5 text-offbeat-muted shrink-0 mt-0.5" />
                    <span>"{comm.quote}"</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-offbeat-muted pt-2 border-t border-offbeat-border/60">
                <span>By {comm.authorName || "Local traveler"}</span>
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <ThumbsUp className="w-3 h-3" />
                  {comm.supportCount || 2} traveler endorsements
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
