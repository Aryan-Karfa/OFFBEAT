import React, { useState, useEffect } from "react";
import type { CommunitySubmissionDto } from "@offbeat/shared";
import { communityService } from "../../services/communityService";
import { CommunityCard } from "./CommunityCard";
import { ContributeModal } from "./ContributeModal";
import { Button } from "../../components/ui/Button";
import { Sparkles, PlusCircle, MessageSquarePlus } from "lucide-react";

interface CommunitySectionProps {
  placeId: string;
  placeName: string;
  destinationId?: string;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  placeId,
  placeName,
  destinationId,
}) => {
  const [submissions, setSubmissions] = useState<CommunitySubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await communityService.getSubmissions({
        placeId,
        limit: 20,
      });
      setSubmissions(res.items);
    } catch {
      setError("Failed to load community discoveries for this place.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (placeId) {
      fetchSubmissions();
    }
  }, [placeId]);

  const handleCreated = (newSub: CommunitySubmissionDto) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  const handleUpdated = (updated: CommunitySubmissionDto) => {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <div className="w-full mt-10 pt-8 border-t border-offbeat-border/70">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-offbeat-accent">
              Human Traveler Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/25">
              COMMUNITY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-offbeat-primary flex items-center gap-2">
            <span>From the OFFBEAT Community</span>
            {submissions.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-offbeat-dark border border-offbeat-border text-offbeat-muted">
                {submissions.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-offbeat-muted mt-1 max-w-xl">
            Real human observations from travelers who have visited {placeName}. Timings, secret
            trails, and crowd advice.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<PlusCircle className="h-4 w-4" />}
          className="self-start sm:self-auto shrink-0 shadow-sm"
        >
          Share a Discovery
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-offbeat-surface/60 border border-offbeat-border/60 p-5"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchSubmissions}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && submissions.length === 0 && (
        <div className="p-8 sm:p-10 rounded-2xl bg-offbeat-surface border border-offbeat-border/70 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-offbeat-accent/15 border border-offbeat-accent/30 flex items-center justify-center text-offbeat-accent mb-3">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-offbeat-primary mb-1">
            No community discoveries yet
          </h3>
          <p className="text-xs text-offbeat-secondary max-w-md mb-6 leading-relaxed">
            Be the first traveler to share something useful about {placeName}. Help future travelers
            discover the best times, angles, and trails.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            SHARE A DISCOVERY
          </Button>
        </div>
      )}

      {/* Discoveries Grid */}
      {!loading && !error && submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {submissions.map((sub) => (
            <CommunityCard key={sub.id} submission={sub} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      {/* Modal */}
      <ContributeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        placeId={placeId}
        placeName={placeName}
        destinationId={destinationId}
        onSuccess={handleCreated}
      />
    </div>
  );
};
