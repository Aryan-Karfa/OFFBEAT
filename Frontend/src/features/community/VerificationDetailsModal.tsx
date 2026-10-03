import React, { useEffect, useState } from "react";
import type { VerificationDetailDto } from "@offbeat/shared";
import { communityService } from "../../services/communityService";
import { VerificationBadge } from "./VerificationBadge";
import { EvidenceStrengthBadge } from "./EvidenceStrengthBadge";

interface VerificationDetailsModalProps {
  submissionId: string;
  submissionTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRecalculated?: (detail: VerificationDetailDto) => void;
}

export const VerificationDetailsModal: React.FC<VerificationDetailsModalProps> = ({
  submissionId,
  submissionTitle,
  isOpen,
  onClose,
  onRecalculated,
}) => {
  const [detail, setDetail] = useState<VerificationDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    communityService
      .getSubmissionVerification(submissionId)
      .then((data) => {
        if (mounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || "Failed to load verification breakdown");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, submissionId]);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setError(null);
      const updated = await communityService.recalculateSubmissionVerification(submissionId);
      setDetail(updated);
      if (onRecalculated) {
        onRecalculated(updated);
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Failed to recalculate evidence");
    } finally {
      setRecalculating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-xs tracking-wider uppercase font-semibold">
                Evidence Engine
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-slate-400 text-xs">Phase 9 Intelligence</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Verification & Evidence Breakdown
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Discovery</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium italic">"{submissionTitle}"</p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading evidence evaluation...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          ) : detail ? (
            <>
              {/* Badges & Headline */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <VerificationBadge status={detail.status} />
                  <EvidenceStrengthBadge
                    strength={detail.strength}
                    score={detail.confidence.score}
                    showScore
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{detail.explanation.headline}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {detail.explanation.summary}
                  </p>
                </div>
              </div>

              {/* Signals Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="text-[11px] text-slate-400 font-medium">Traveler Support</div>
                  <div className="text-base font-bold text-white mt-1">
                    {detail.confidence.supportCount}
                    <span className="text-xs font-normal text-slate-400 ml-1">travelers</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="text-[11px] text-slate-400 font-medium">Attached Evidence</div>
                  <div className="text-base font-bold text-white mt-1">
                    {detail.confidence.evidenceCount}
                    <span className="text-xs font-normal text-slate-400 ml-1">items</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="text-[11px] text-slate-400 font-medium">
                    External Corroboration
                  </div>
                  <div className="text-sm font-semibold mt-1">
                    {detail.confidence.externalCorroboration ? (
                      <span className="text-emerald-400">✓ Verified Place Record</span>
                    ) : (
                      <span className="text-slate-400">Independent Tip</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Contradictions / Reports
                  </div>
                  <div className="text-sm font-semibold mt-1">
                    {detail.confidence.contradictionCount > 0 ? (
                      <span className="text-amber-400">
                        {detail.confidence.contradictionCount} under review
                      </span>
                    ) : (
                      <span className="text-emerald-400">0 reports</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Signals list */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Observed Verification Signals
                </h4>
                <div className="space-y-1.5">
                  {detail.explanation.signals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded-md bg-slate-800/20"
                    >
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-negotiable philosophical notice */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Non-dogmatic verification:</span>{" "}
                Confidence indicates empirical evidence strength across traveler confirmations and
                records. It represents evidence, not absolute factual certainty.
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            disabled={recalculating || loading}
            onClick={handleRecalculate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <span>{recalculating ? "Recalculating..." : "↻ Recalculate Evidence"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
