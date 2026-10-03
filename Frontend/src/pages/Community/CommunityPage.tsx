import React, { useState, useEffect } from "react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { communityService } from "../../services/communityService";
import { CommunityCard, ContributeModal } from "../../features/community";
import type { CommunitySubmissionDto, SubmissionType } from "@offbeat/shared";
import {
  Sparkles,
  PlusCircle,
  Filter,
  Camera,
  Clock,
  Users,
  Compass,
  MessageSquarePlus,
} from "lucide-react";

const FILTER_CHIPS: Array<{ type?: SubmissionType; label: string; icon?: React.ReactNode }> = [
  { label: "All Discoveries" },
  { type: "PHOTO_SPOT", label: "Photo Spots", icon: <Camera className="h-3.5 w-3.5" /> },
  { type: "BEST_TIME", label: "Best Times", icon: <Clock className="h-3.5 w-3.5" /> },
  { type: "CROWD_TIP", label: "Crowd Tips", icon: <Users className="h-3.5 w-3.5" /> },
  { type: "TRAVEL_TIP", label: "Travel Tips", icon: <Compass className="h-3.5 w-3.5" /> },
  { type: "HIDDEN_PLACE", label: "Hidden Places", icon: <Sparkles className="h-3.5 w-3.5" /> },
];

export const CommunityPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<CommunitySubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<SubmissionType | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async (type?: SubmissionType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communityService.getSubmissions({
        type,
        limit: 30,
      });
      setSubmissions(res.items);
    } catch {
      setError("Failed to fetch community discoveries. Check connection to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(selectedType);
  }, [selectedType]);

  const handleCreated = (newSub: CommunitySubmissionDto) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  const handleUpdated = (updated: CommunitySubmissionDto) => {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent">
                  The Living Network
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/25">
                  Phase 8 Live
                </span>
              </div>
              <Heading level={1} size="h1" className="mb-2">
                Community Discoveries
              </Heading>
              <Text variant="lead" className="text-base text-offbeat-secondary max-w-xl">
                Real human observations shared by travelers. Timings, side trails, viewpoints, and
                crowd patterns verified by peers.
              </Text>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<PlusCircle className="h-4 w-4" />}
              className="self-start sm:self-auto shadow-sm"
            >
              SHARE A DISCOVERY
            </Button>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            <span className="text-xs text-offbeat-muted flex items-center gap-1 shrink-0 mr-1 font-semibold uppercase tracking-wider">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            {FILTER_CHIPS.map((chip, idx) => {
              const isActive = selectedType === chip.type;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedType(chip.type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                    isActive
                      ? "bg-offbeat-accent/20 border-offbeat-accent text-offbeat-primary font-semibold shadow-sm"
                      : "bg-offbeat-dark/70 border-offbeat-border text-offbeat-secondary hover:text-offbeat-primary hover:border-offbeat-border/80"
                  }`}
                >
                  {chip.icon && (
                    <span className={isActive ? "text-offbeat-accent" : "text-offbeat-muted"}>
                      {chip.icon}
                    </span>
                  )}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-offbeat-surface/60 border border-offbeat-border/60 p-5"
                />
              ))}
            </div>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-red-300 flex items-center justify-between mb-8">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={() => fetchSubmissions(selectedType)}>
                Retry
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && submissions.length === 0 && (
            <div className="p-12 rounded-2xl bg-offbeat-surface border border-offbeat-border/70 text-center flex flex-col items-center justify-center my-6">
              <div className="h-12 w-12 rounded-full bg-offbeat-accent/15 border border-offbeat-accent/30 flex items-center justify-center text-offbeat-accent mb-3">
                <MessageSquarePlus className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-offbeat-primary mb-1">
                No discoveries found in this category
              </h3>
              <p className="text-xs text-offbeat-secondary max-w-md mb-6 leading-relaxed">
                Be the first traveler to share something for this filter. Help the community
                discover offbeat angles and timings.
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

          {/* Submissions Grid */}
          {!loading && !error && submissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {submissions.map((sub) => (
                <CommunityCard key={sub.id} submission={sub} onUpdated={handleUpdated} />
              ))}
            </div>
          )}

          {/* Phase Notice Footer */}
          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Phase 8 Community Intelligence is active. All discoveries, supports, and reports
              persist and feed the living travel knowledge layer.
            </span>
          </div>

          {/* Modal */}
          <ContributeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleCreated}
          />
        </Container>
      </Section>
    </div>
  );
};
