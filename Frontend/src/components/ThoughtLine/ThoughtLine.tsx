import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

export interface ThoughtLineProps {
  steps?: string[];
  currentStepIndex?: number;
  isWorking?: boolean;
  isSettled?: boolean;
  showTimer?: boolean;
  elapsedSeconds?: number;
  className?: string;
  onToggleExpand?: () => void;
}

export const ThoughtLine: React.FC<ThoughtLineProps> = ({
  steps = [
    "Understanding your travel preferences",
    "Exploring destinations",
    "Checking places and experiences",
    "Comparing alternatives",
    "Building your recommendations",
  ],
  currentStepIndex = 0,
  isWorking = true,
  isSettled = false,
  showTimer = true,
  elapsedSeconds: controlledElapsed,
  className = "",
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Live timer tracking
  useEffect(() => {
    if (!isWorking || isSettled) return;

    const startTime = Date.now() - elapsed * 1000;
    const interval = setInterval(() => {
      const current = (Date.now() - startTime) / 1000;
      setElapsed(current);
    }, 100);

    return () => clearInterval(interval);
  }, [isWorking, isSettled, elapsed]);

  // When controlled elapsed changes, update local state
  useEffect(() => {
    if (controlledElapsed !== undefined) {
      setElapsed(controlledElapsed);
    }
  }, [controlledElapsed]);

  // Auto-collapse slightly when settled after a brief moment
  useEffect(() => {
    if (isSettled) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(true);
    }
  }, [isSettled]);

  const activeStepText =
    currentStepIndex < steps.length ? steps[currentStepIndex] : steps[steps.length - 1];

  const formattedTime = (
    controlledElapsed !== undefined ? controlledElapsed : elapsed
  ).toFixed(1);

  return (
    <div
      className={`rounded-xl border border-[#1f2633] bg-[#12161f]/90 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-surface-card ${className}`}
    >
      {/* Reasoning Trace Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2633]/60 bg-[#0d1017]/80">
        <div className="flex items-center gap-2.5">
          {/* Glyph animation */}
          <div className="relative flex items-center justify-center w-6 h-6">
            <AnimatePresence mode="wait">
              {isSettled ? (
                <motion.div
                  key="settled-glyph"
                  initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-emerald-400"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="thinking-glyph"
                  animate={{
                    rotate: isWorking ? [0, 15, -15, 0] : 0,
                    scale: isWorking ? [1, 1.15, 1] : 1,
                  }}
                  transition={{
                    repeat: isWorking ? Infinity : 0,
                    duration: 2.2,
                    ease: "easeInOut",
                  }}
                  className="text-[#ff5a36]"
                >
                  <HugeiconsIcon icon={SparklesIcon} size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Label Crossfade */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <AnimatePresence mode="wait">
              {isSettled ? (
                <motion.span
                  key="settled-title"
                  initial={{ opacity: 0, y: 3, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.3 }}
                  className="font-medium text-slate-200"
                >
                  Thought for {formattedTime}s
                </motion.span>
              ) : (
                <motion.span
                  key="thinking-title"
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-medium text-slate-300 flex items-center gap-1.5"
                >
                  <span>OFFBEAT AI Reasoning</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff5a36] animate-ping" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Live Timer & Expand Toggle */}
        <div className="flex items-center gap-3">
          {showTimer && !isSettled && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-[#1f2633]">
              <HugeiconsIcon icon={Clock01Icon} size={12} className="text-[#e5a93c]" />
              <span>{formattedTime}s</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
          >
            {isExpanded ? "Hide Trace" : "Show Trace"}
          </button>
        </div>
      </div>

      {/* Progressive Thought Steps / Trace Line */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="p-4 space-y-3"
          >
            {/* Active single step summary banner */}
            {!isSettled && (
              <motion.div
                key={activeStepText}
                initial={{ opacity: 0, x: -8, filter: "blur(3px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-[#ff5a36] font-medium flex items-center gap-2 pb-1 border-b border-[#1f2633]/40"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a36] animate-pulse" />
                <span>Current step: {activeStepText}</span>
              </motion.div>
            )}

            {/* List of progressive steps */}
            <div className="relative pl-5 space-y-2.5 text-xs before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#1f2633]">
              {steps.map((step, idx) => {
                const isPast = idx < currentStepIndex || isSettled;
                const isCurrent = idx === currentStepIndex && !isSettled;
                const isUpcoming = idx > currentStepIndex && !isSettled;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{
                      opacity: isUpcoming ? 0.35 : 1,
                      y: 0,
                    }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className="relative flex items-center justify-between"
                  >
                    {/* Node indicator */}
                    <div
                      className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full border transition-all ${
                        isPast
                          ? "bg-emerald-500 border-emerald-400"
                          : isCurrent
                          ? "bg-[#ff5a36] border-[#ff704f] ring-2 ring-[#ff5a36]/30 animate-pulse"
                          : "bg-slate-800 border-slate-700"
                      }`}
                    />

                    <span
                      className={`transition-colors ${
                        isPast
                          ? "text-slate-300 font-medium"
                          : isCurrent
                          ? "text-white font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      {isPast ? "Done" : isCurrent ? "Working..." : "Queued"}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Settled conclusion summary */}
            {isSettled && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4 }}
                className="mt-3 pt-3 border-t border-[#1f2633]/60 text-xs text-slate-300 flex items-center justify-between bg-emerald-500/5 -mx-4 -mb-4 p-3 rounded-b-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-medium text-emerald-300">
                    Thought process complete
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  Ready for exploration
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
