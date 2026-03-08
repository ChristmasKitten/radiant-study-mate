import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "studyflow_gamification";

export interface GamificationData {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  subjectColors: Record<string, string>;
}

const XP_PER_SESSION = 50;
const XP_STREAK_BONUS = 20;
const XP_PER_LEVEL = 200;

const DEFAULT_SUBJECT_COLORS: Record<string, string> = {
  Math: "#ef4444",
  Science: "#3b82f6",
  English: "#f59e0b",
  History: "#8b5cf6",
};

const PALETTE = [
  "none",
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#f43f5e",
];

function loadData(): GamificationData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    subjectColors: { ...DEFAULT_SUBJECT_COLORS },
  };
}

function saveData(data: GamificationData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function xpForLevel(level: number) {
  return level * XP_PER_LEVEL;
}

export function useGamification() {
  const [data, setData] = useState<GamificationData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const awardSessionXP = useCallback(() => {
    setData((prev) => {
      const today = getToday();
      const yesterday = getYesterday();
      let streak = prev.currentStreak;

      if (prev.lastStudyDate === today) {
        // Already studied today, no streak change
      } else if (prev.lastStudyDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }

      const bonus = streak > 1 ? XP_STREAK_BONUS * Math.min(streak, 10) : 0;
      const newXP = prev.xp + XP_PER_SESSION + bonus;
      let newLevel = prev.level;
      while (newXP >= xpForLevel(newLevel)) {
        newLevel++;
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        currentStreak: streak,
        longestStreak: Math.max(prev.longestStreak, streak),
        lastStudyDate: today,
      };
    });
  }, []);

  const xpInCurrentLevel = data.xp - (data.level > 1 ? xpForLevel(data.level - 1) : 0);
  const xpNeededForNext = xpForLevel(data.level) - (data.level > 1 ? xpForLevel(data.level - 1) : 0);
  const levelProgress = xpNeededForNext > 0 ? xpInCurrentLevel / xpNeededForNext : 0;

  const getSubjectColor = useCallback(
    (subject: string) => {
      return data.subjectColors[subject] ?? PALETTE[Math.abs(hashCode(subject)) % PALETTE.length];
    },
    [data.subjectColors]
  );

  const setSubjectColor = useCallback((subject: string, color: string) => {
    setData((prev) => ({
      ...prev,
      subjectColors: { ...prev.subjectColors, [subject]: color },
    }));
  }, []);

  return {
    ...data,
    xpInCurrentLevel,
    xpNeededForNext,
    levelProgress,
    awardSessionXP,
    getSubjectColor,
    setSubjectColor,
    palette: PALETTE,
  };
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
