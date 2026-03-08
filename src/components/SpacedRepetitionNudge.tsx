import { useState, useEffect, useMemo } from "react";
import { Lightbulb, X } from "lucide-react";

const STORAGE_KEY = "studyflow_last_studied";

interface SpacedRepetitionNudgeProps {
  subjects: string[];
  currentSubject: string;
  isRunning: boolean;
  onSwitchSubject: (subject: string) => void;
  getSubjectColor?: (subject: string) => string;
}

function loadLastStudied(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveLastStudied(data: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function markSubjectStudied(subject: string) {
  const data = loadLastStudied();
  data[subject] = Date.now();
  saveLastStudied(data);
}

function daysAgo(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

export function SpacedRepetitionNudge({
  subjects,
  currentSubject,
  isRunning,
  onSwitchSubject,
  getSubjectColor,
}: SpacedRepetitionNudgeProps) {
  const [dismissed, setDismissed] = useState<string | null>(null);
  const lastStudied = useMemo(() => loadLastStudied(), []);

  // Refresh when subject changes (session completed)
  const [, refresh] = useState(0);
  useEffect(() => {
    const handler = () => refresh((n) => n + 1);
    window.addEventListener("studyflow:session-complete", handler);
    return () => window.removeEventListener("studyflow:session-complete", handler);
  }, []);

  const suggestion = useMemo(() => {
    if (subjects.length <= 1) return null;

    // Find the subject not studied for the longest time (excluding current)
    let oldest: { subject: string; days: number } | null = null;

    for (const subject of subjects) {
      if (subject === currentSubject) continue;

      const ts = lastStudied[subject];
      const days = ts ? daysAgo(ts) : 999; // Never studied = very old

      if (days >= 2 && (!oldest || days > oldest.days)) {
        oldest = { subject, days };
      }
    }

    return oldest;
  }, [subjects, currentSubject, lastStudied]);

  // Don't show while timer is running, or if dismissed, or no suggestion
  if (isRunning || !suggestion || dismissed === suggestion.subject) return null;

  const color = getSubjectColor?.(suggestion.subject);
  const daysText = suggestion.days >= 999
    ? "never studied"
    : suggestion.days === 1
    ? "1 day ago"
    : `${suggestion.days} days ago`;

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Lightbulb className="h-4 w-4 shrink-0 text-timer-warn" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Time to revisit </span>
            <button
              onClick={() => onSwitchSubject(suggestion.subject)}
              className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
            >
              {color && color !== "none" && (
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              )}
              {suggestion.subject}
            </button>
            <span className="text-muted-foreground"> — last studied {daysText}</span>
          </p>
        </div>
        <button
          onClick={() => setDismissed(suggestion.subject)}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
