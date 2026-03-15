import { useState, useEffect, useCallback, useRef } from "react";
import type { DailyRecord } from "./useStudyTimer";

const STORAGE_KEY = "studyflow_burnout";

interface BurnoutData {
  quitCount: number; // sessions quit early today
  lastQuitDate: string;
  focusScores: { date: string; score: number }[];
  dismissedUntil: string | null; // ISO date when dismissed for the day
}

interface BurnoutWarning {
  type: "quit" | "declining" | "focus" | "overload";
  message: string;
  suggestion: string;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function loadBurnoutData(): BurnoutData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { quitCount: 0, lastQuitDate: "", focusScores: [], dismissedUntil: null };
}

function saveBurnoutData(data: BurnoutData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useBurnoutWarning({
  dailyRecords,
  totalFocusTime,
  lastFocusScore,
  isRunning,
}: {
  dailyRecords: DailyRecord[];
  totalFocusTime: number;
  lastFocusScore: number | null;
  isRunning: boolean;
}) {
  const [data, setData] = useState<BurnoutData>(loadBurnoutData);
  const [dismissed, setDismissed] = useState(false);
  const prevRunningRef = useRef(isRunning);

  // Reset quit count on new day
  useEffect(() => {
    const today = getToday();
    if (data.lastQuitDate !== today) {
      const updated = { ...data, quitCount: 0, lastQuitDate: today };
      if (data.dismissedUntil && data.dismissedUntil < today) {
        updated.dismissedUntil = null;
      }
      setData(updated);
      saveBurnoutData(updated);
      setDismissed(false);
    }
  }, []);

  // Track session quits (timer was running, now stopped, but no session-complete event)
  const trackQuit = useCallback(() => {
    setData((prev) => {
      const today = getToday();
      const updated = {
        ...prev,
        quitCount: prev.lastQuitDate === today ? prev.quitCount + 1 : 1,
        lastQuitDate: today,
      };
      saveBurnoutData(updated);
      return updated;
    });
  }, []);

  // Track focus scores
  useEffect(() => {
    if (lastFocusScore !== null && lastFocusScore > 0) {
      setData((prev) => {
        const today = getToday();
        const scores = [...prev.focusScores, { date: today, score: lastFocusScore }].slice(-14);
        const updated = { ...prev, focusScores: scores };
        saveBurnoutData(updated);
        return updated;
      });
    }
  }, [lastFocusScore]);

  // Detect warnings
  const warnings: BurnoutWarning[] = [];
  const today = getToday();

  // 1. Quitting sessions (3+ quits today)
  if (data.quitCount >= 3) {
    warnings.push({
      type: "quit",
      message: "You've stopped a few sessions early today.",
      suggestion: "Try a shorter session — even 10 minutes counts! 💪",
    });
  }

  // 2. Declining daily study time (3+ days of decline)
  const recent3 = dailyRecords
    .filter((r) => r.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  if (recent3.length >= 3) {
    const declining = recent3[0].totalSeconds < recent3[1].totalSeconds &&
      recent3[1].totalSeconds < recent3[2].totalSeconds;
    if (declining && recent3[2].totalSeconds > 0) {
      warnings.push({
        type: "declining",
        message: "Your study time has been decreasing.",
        suggestion: "It's okay to slow down. Try a gentle 15-minute session to get back on track. 🌱",
      });
    }
  }

  // 3. Focus score dropping (average of last 3 < 60)
  const recentScores = data.focusScores.slice(-3);
  if (recentScores.length >= 3) {
    const avg = recentScores.reduce((s, x) => s + x.score, 0) / recentScores.length;
    if (avg < 60) {
      warnings.push({
        type: "focus",
        message: "Your focus has been lower than usual.",
        suggestion: "You might need a break. Try a shorter session or take a walk. 🧘",
      });
    }
  }

  // 4. Daily overload (6+ hours today)
  if (totalFocusTime >= 6 * 3600) {
    warnings.push({
      type: "overload",
      message: "You've studied over 6 hours today — impressive but intense!",
      suggestion: "Consider wrapping up for today. Rest helps your brain consolidate what you've learned. 😴",
    });
  }

  const isDismissedToday = dismissed || (data.dismissedUntil === today);
  const activeWarnings = isDismissedToday ? [] : warnings;

  const dismiss = useCallback(() => {
    setDismissed(true);
    setData((prev) => {
      const updated = { ...prev, dismissedUntil: getToday() };
      saveBurnoutData(updated);
      return updated;
    });
  }, []);

  return {
    warnings: activeWarnings,
    allWarnings: warnings,
    hasBurnoutRisk: warnings.length > 0,
    dismiss,
    isDismissed: isDismissedToday,
    trackQuit,
  };
}
