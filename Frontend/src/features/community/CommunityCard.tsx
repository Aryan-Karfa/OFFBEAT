import React, { useState } from "react";
import type { CommunitySubmissionDto, SupportType, ReportReason } from "@offbeat/shared";
import { communityService } from "../../services/communityService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ThumbsUp,
  CheckCircle2,
  Flag,
  Camera,
  Clock,
  Users,
  Compass,
  Store,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  AlertCircle,
  X,
} from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";
import { EvidenceStrengthBadge } from "./EvidenceStrengthBadge";
import { VerificationDetailsModal } from "./VerificationDetailsModal";

interface CommunityCardProps {
  submission: CommunitySubmissionDto;
  onUpdated?: (updated: CommunitySubmissionDto) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ submission, onUpdated }) => {
  const [supportState, setSupportState] = useState(submission.support);
  const [supporting, setSupporting] = useState<SupportType | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("OUTDATED");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const getTypeIcon = () => {
    switch (submission.type) {
      case "PHOTO_SPOT":
        return <Camera className="h-3.5 w-3.5" />;
      case "BEST_TIME":
        return <Clock className="h-3.5 w-3.5" />;
      case "CROWD_TIP":
        return <Users className="h-3.5 w-3.5" />;
      case "TRAVEL_TIP":
        return <Compass className="h-3.5 w-3.5" />;
      case "LOCAL_BUSINESS":
        return <Store className="h-3.5 w-3.5" />;
      case "RESTAURANT":
        return <UtensilsCrossed className="h-3.5 w-3.5" />;
      default:
        return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  const getTypeLabel = () => {
    switch (submission.type) {
      case "PHOTO_SPOT":
        return "Photo Spot";
      case "BEST_TIME":
        return "Best Time";
      case "CROWD_TIP":
        return "Crowd Tip";
      case "TRAVEL_TIP":
        return "Travel Tip";
      case "HIDDEN_PLACE":
        return "Hidden Place";
      case "LOCAL_BUSINESS":
        return "Local Business";
      case "RESTAURANT":
        return "Food Discovery";
      case "TAKE_HOME":
        return "Take Home";
      default:
        return "Observation";
    }
  };

  const handleSupport = async (type: SupportType) => {
    if (supportState.userSupported) return;
    setSupporting(type);

    try {
      const updatedSupport = await communityService.supportSubmission(submission.id, type);
      setSupportState(updatedSupport);
      if (onUpdated) {
        onUpdated({
          ...submission,
          support: updatedSupport,
        });
      }
    } catch (err: unknown) {
      // If conflict error, already supported
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already supported")) {
        setSupportState((prev) => ({
          ...prev,
          userSupported: true,
          userSupportType: type,
        }));
      }
    } finally {
      setSupporting(null);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReporting(true);
    setReportError(null);

    try {
      const res = await communityService.reportSubmission(submission.id, {
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      });

      setReportSuccess(res.message);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(null);
        setReportDescription("");
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit report";
      setReportError(message);
    } finally {
      setReporting(false);
    }
  };

  const firstPhotoEvidence = submission.evidence.find((e) => e.type === "PHOTO" && e.mediaUrl);

  return (
    <Card
      variant="elevated"
      padding="md"
      className="flex flex-col justify-between border-offbeat-border/70 hover:border-offbeat-accent/40 transition-all duration-200 bg-offbeat-surface shadow-sm"
    >
      <div>
        {/* Top Badges & Source Distinction */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-offbeat-dark/80 border border-offbeat-border text-[11px] font-semibold text-offbeat-accent">
            {getTypeIcon()}
            <span>{getTypeLabel()}</span>
          </div>

          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-500/25"
            title="Sourced from actual traveler contribution"
          >
            OFFBEAT COMMUNITY
          </span>
        </div>

        {/* Phase 9 Verification & Evidence Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
          <VerificationBadge
            status={submission.verification?.status || "PENDING"}
            size="sm"
            onClick={() => setShowVerificationModal(true)}
          />
          {submission.verification && (
            <EvidenceStrengthBadge
              strength={submission.verification.strength}
              score={submission.verification.score}
              showScore
            />
          )}
        </div>

        {/* Discovery Title */}
        <h4 className="font-display text-base font-bold text-offbeat-primary mb-2 line-clamp-2">
          {submission.title}
        </h4>

        {/* Place / Destination context if present */}
        {submission.place && (
          <div className="flex items-center gap-1 text-[11px] text-offbeat-muted mb-2.5">
            <MapPin className="h-3 w-3 text-offbeat-accent shrink-0" />
            <span className="font-medium text-offbeat-secondary">
              {submission.place.name}
              {submission.place.destination ? ` • ${submission.place.destination}` : ""}
            </span>
          </div>
        )}

        {/* Human Voice Description */}
        <p className="text-xs text-offbeat-secondary leading-relaxed mb-4">
          &ldquo;{submission.content}&rdquo;
        </p>

        {/* Evidence Photo if attached */}
        {firstPhotoEvidence?.mediaUrl && (
          <div className="relative h-36 w-full rounded-xl overflow-hidden mb-4 bg-offbeat-dark border border-offbeat-border/60">
            <img
              src={firstPhotoEvidence.mediaUrl}
              alt={submission.title}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {firstPhotoEvidence.content && (
              <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] text-offbeat-secondary truncate">
                {firstPhotoEvidence.content}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Author Info */}
        <div className="pt-3 border-t border-offbeat-border/60 flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {submission.author.avatarUrl ? (
              <img
                src={submission.author.avatarUrl}
                alt={submission.author.displayName}
                className="h-5 w-5 rounded-full object-cover border border-offbeat-border"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-offbeat-accent/20 border border-offbeat-accent/40 flex items-center justify-center text-[10px] font-bold text-offbeat-accent">
                {submission.author.displayName.charAt(0)}
              </div>
            )}
            <span className="text-[11px] text-offbeat-muted">
              Shared by{" "}
              <strong className="text-offbeat-secondary font-medium">
                {submission.author.displayName}
              </strong>
            </span>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="text-[11px] text-offbeat-muted hover:text-red-400 transition-colors p-1 flex items-center gap-1"
            title="Report inaccurate or outdated discovery"
          >
            <Flag className="h-3 w-3" />
          </button>
        </div>

        {/* Support Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSupport("USEFUL")}
              disabled={supportState.userSupported || supporting !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                supportState.userSupported && supportState.userSupportType === "USEFUL"
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm"
                  : "bg-offbeat-dark/70 border-offbeat-border hover:border-offbeat-border/80 text-offbeat-secondary hover:text-offbeat-primary"
              } disabled:cursor-default`}
            >
              <ThumbsUp className="h-3.5 w-3.5 text-offbeat-accent" />
              <span>Useful</span>
              <span className="font-mono text-[11px] text-offbeat-muted ml-0.5">
                {supportState.usefulCount}
              </span>
            </button>

            <button
              onClick={() => handleSupport("CONFIRM")}
              disabled={supportState.userSupported || supporting !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                supportState.userSupported && supportState.userSupportType === "CONFIRM"
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm"
                  : "bg-offbeat-dark/70 border-offbeat-border hover:border-offbeat-border/80 text-offbeat-secondary hover:text-offbeat-primary"
              } disabled:cursor-default`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Confirm</span>
              <span className="font-mono text-[11px] text-offbeat-muted ml-0.5">
                {supportState.confirmCount}
              </span>
            </button>
          </div>

          {supportState.count > 0 && (
            <span className="text-[11px] text-offbeat-muted font-medium">
              {supportState.count}{" "}
              {supportState.count === 1 ? "traveler supported" : "travelers supported"}
            </span>
          )}
        </div>
      </div>

      {/* Lightweight Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-offbeat-surface border border-offbeat-border rounded-2xl shadow-xl overflow-hidden p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-offbeat-border/70">
              <h3 className="text-base font-bold text-offbeat-primary">Report Discovery</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-offbeat-muted hover:text-offbeat-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reportError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 mb-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{reportError}</span>
              </div>
            )}

            {reportSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{reportSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-offbeat-secondary mb-1.5">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as ReportReason)}
                    className="w-full px-3 py-2 rounded-xl bg-offbeat-dark/80 border border-offbeat-border text-xs text-offbeat-primary focus:outline-none focus:border-offbeat-accent"
                  >
                    <option value="OUTDATED">Outdated information</option>
                    <option value="INCORRECT">Factually incorrect</option>
                    <option value="DUPLICATE">Duplicate discovery</option>
                    <option value="SPAM">Spam or promotional</option>
                    <option value="MISLEADING">Misleading</option>
                    <option value="INAPPROPRIATE">Inappropriate content</option>
                    <option value="OTHER">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-offbeat-secondary mb-1.5">
                    Additional Context{" "}
                    <span className="font-normal lowercase text-offbeat-muted">(optional)</span>
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Briefly explain what changed or why this is incorrect..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3 py-2 rounded-xl bg-offbeat-dark/80 border border-offbeat-border text-xs text-offbeat-primary focus:outline-none focus:border-offbeat-accent resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportModal(false)}
                    disabled={reporting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={reporting}>
                    {reporting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      <VerificationDetailsModal
        submissionId={submission.id}
        submissionTitle={submission.title}
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onRecalculated={(updatedDetail) => {
          if (onUpdated) {
            onUpdated({
              ...submission,
              verification: {
                status: updatedDetail.status,
                strength: updatedDetail.strength,
                score: updatedDetail.confidence.score,
                supportedCount: updatedDetail.confidence.supportCount,
                externalCorroborated: updatedDetail.confidence.externalCorroboration,
                headline: updatedDetail.explanation.headline,
              },
            });
          }
        }}
      />
    </Card>
  );
};
