import React, { useState } from "react";
import type { SubmissionType, CommunitySubmissionDto } from "@offbeat/shared";
import { communityService } from "../../services/communityService";
import { Button } from "../../components/ui/Button";
import {
  X,
  Sparkles,
  Camera,
  Clock,
  Users,
  Compass,
  Store,
  UtensilsCrossed,
  Gift,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId?: string;
  placeName?: string;
  destinationId?: string;
  onSuccess?: (submission: CommunitySubmissionDto) => void;
}

interface TypeOption {
  type: SubmissionType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: "PHOTO_SPOT",
    label: "Photo Spot",
    icon: <Camera className="h-4 w-4" />,
    description: "Vantage points, lighting angles, framing spots",
  },
  {
    type: "BEST_TIME",
    label: "Best Time",
    icon: <Clock className="h-4 w-4" />,
    description: "Dawn arrival, golden hour, optimal seasons",
  },
  {
    type: "CROWD_TIP",
    label: "Crowd Tip",
    icon: <Users className="h-4 w-4" />,
    description: "Peak tour bus hours, quiet times, bottleneck escapes",
  },
  {
    type: "TRAVEL_TIP",
    label: "Travel Tip",
    icon: <Compass className="h-4 w-4" />,
    description: "Transport logistics, trails, gear recommendations",
  },
  {
    type: "HIDDEN_PLACE",
    label: "Hidden Place",
    icon: <Sparkles className="h-4 w-4" />,
    description: "Lesser-known spot, side trail, secret vista",
  },
  {
    type: "LOCAL_BUSINESS",
    label: "Local Business",
    icon: <Store className="h-4 w-4" />,
    description: "Independent crafts, artisan workshops, tea stalls",
  },
  {
    type: "RESTAURANT",
    label: "Food Discovery",
    icon: <UtensilsCrossed className="h-4 w-4" />,
    description: "Heritage kitchens, local delicacies, quiet cafes",
  },
  {
    type: "TAKE_HOME",
    label: "Take Home",
    icon: <Gift className="h-4 w-4" />,
    description: "Local crafts, specialty tea, indigenous keepsakes",
  },
  {
    type: "OTHER",
    label: "Other Observation",
    icon: <HelpCircle className="h-4 w-4" />,
    description: "General traveler advice or historical detail",
  },
];

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  placeId,
  placeName,
  destinationId,
  onSuccess,
}) => {
  const [selectedType, setSelectedType] = useState<SubmissionType>("PHOTO_SPOT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }
    if (content.trim().length < 10) {
      setError("Please describe your discovery with at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const evidence = mediaUrl.trim()
        ? [
            {
              type: "PHOTO" as const,
              mediaUrl: mediaUrl.trim(),
              content: "Traveler uploaded photo evidence",
            },
          ]
        : undefined;

      const submission = await communityService.createSubmission({
        placeId,
        destinationId,
        type: selectedType,
        title: title.trim(),
        content: content.trim(),
        evidence,
      });

      setSuccessMessage("Discovery shared. Thanks for adding something useful to OFFBEAT.");
      if (onSuccess) {
        onSuccess(submission);
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setTitle("");
        setContent("");
        setMediaUrl("");
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit discovery. Please check details and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-offbeat-surface border border-offbeat-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-offbeat-border/70 flex items-center justify-between bg-offbeat-dark/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-offbeat-accent">
                OFFBEAT Community Knowledge
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-offbeat-primary mt-0.5">
              Share a Discovery
            </h2>
            {placeName && (
              <p className="text-xs text-offbeat-muted mt-0.5">
                Contributing traveler knowledge for{" "}
                <strong className="text-offbeat-secondary">{placeName}</strong>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-offbeat-muted hover:text-offbeat-primary hover:bg-offbeat-border/40 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-offbeat-secondary mb-2.5">
              Discovery Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1 ${
                      isSelected
                        ? "bg-offbeat-accent/15 border-offbeat-accent text-offbeat-primary shadow-sm"
                        : "bg-offbeat-dark/60 border-offbeat-border hover:border-offbeat-border/80 text-offbeat-muted hover:text-offbeat-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-offbeat-primary">
                      <span className={isSelected ? "text-offbeat-accent" : "text-offbeat-muted"}>
                        {opt.icon}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-offbeat-muted line-clamp-1">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-offbeat-secondary mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quiet pine path behind observatory tower"
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl bg-offbeat-dark/70 border border-offbeat-border text-sm text-offbeat-primary placeholder:text-offbeat-muted focus:outline-none focus:border-offbeat-accent transition-colors"
              required
            />
            <span className="text-[11px] text-offbeat-muted mt-1 block">
              Be concise and descriptive for fellow travelers.
            </span>
          </div>

          {/* 3. Description / Knowledge */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-offbeat-secondary mb-1.5">
              What Did You Discover?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide exact details: which trail to take, best arrival timing, avoiding tour groups, local specialties..."
              rows={4}
              maxLength={5000}
              className="w-full px-4 py-2.5 rounded-xl bg-offbeat-dark/70 border border-offbeat-border text-sm text-offbeat-primary placeholder:text-offbeat-muted focus:outline-none focus:border-offbeat-accent transition-colors leading-relaxed resize-none"
              required
            />
            <div className="flex justify-between text-[11px] text-offbeat-muted mt-1">
              <span>Human traveler knowledge only. Avoid generic reviews.</span>
              <span>{content.length}/5000</span>
            </div>
          </div>

          {/* 4. Optional Photo / Media URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-offbeat-secondary mb-1.5">
              Photo URL <span className="font-normal lowercase text-offbeat-muted">(optional)</span>
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-offbeat-dark/70 border border-offbeat-border text-sm text-offbeat-primary placeholder:text-offbeat-muted focus:outline-none focus:border-offbeat-accent transition-colors"
            />
            <span className="text-[11px] text-offbeat-muted mt-1 block">
              Optional image link illustrating the spot or vantage point.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-offbeat-border/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              {submitting ? "Sharing..." : "Share Discovery"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
