import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "studyflow_gamification";

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  check: (data: GamificationData) => boolean;
}

export interface GamificationData {
  xp: number;
  totalXpEarned: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  subjectColors: Record<string, string>;
  totalSessions: number;
  unlockedBadges: string[];
  unlockedItems: string[];
  equippedItems: Record<string, string>;
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

export const ALL_BADGES: Badge[] = [
  { id: "first_session", name: "First Step", description: "Complete your first session", emoji: "🌱", check: (d) => d.totalSessions >= 1 },
  { id: "10_sessions", name: "Dedicated", description: "Complete 10 sessions", emoji: "📚", check: (d) => d.totalSessions >= 10 },
  { id: "50_sessions", name: "Scholar", description: "Complete 50 sessions", emoji: "🎓", check: (d) => d.totalSessions >= 50 },
  { id: "100_sessions", name: "Master", description: "Complete 100 sessions", emoji: "🏆", check: (d) => d.totalSessions >= 100 },
  { id: "streak_3", name: "On Fire", description: "3-day study streak", emoji: "🔥", check: (d) => d.longestStreak >= 3 },
  { id: "streak_7", name: "Weekly Warrior", description: "7-day study streak", emoji: "⚡", check: (d) => d.longestStreak >= 7 },
  { id: "streak_14", name: "Unstoppable", description: "14-day study streak", emoji: "💪", check: (d) => d.longestStreak >= 14 },
  { id: "streak_30", name: "Legend", description: "30-day study streak", emoji: "👑", check: (d) => d.longestStreak >= 30 },
  { id: "level_5", name: "Rising Star", description: "Reach level 5", emoji: "⭐", check: (d) => d.level >= 5 },
  { id: "level_10", name: "Powerhouse", description: "Reach level 10", emoji: "💎", check: (d) => d.level >= 10 },
  { id: "xp_1000", name: "XP Hunter", description: "Earn 1,000 XP", emoji: "✨", check: (d) => d.xp >= 1000 },
  { id: "xp_5000", name: "XP Legend", description: "Earn 5,000 XP", emoji: "🌟", check: (d) => d.xp >= 5000 },
];

function loadData(): GamificationData {
  const defaultData: GamificationData = {
    xp: 0,
    totalXpEarned: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    subjectColors: { ...DEFAULT_SUBJECT_COLORS },
    totalSessions: 0,
    unlockedBadges: [],
    unlockedItems: [],
    equippedItems: {},
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    }
  } catch {}
  return defaultData;
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

function checkBadges(data: GamificationData): string[] {
  const newlyUnlocked: string[] = [];
  for (const badge of ALL_BADGES) {
    if (!data.unlockedBadges.includes(badge.id) && badge.check(data)) {
      newlyUnlocked.push(badge.id);
    }
  }
  return newlyUnlocked;
}

export function xpForLevel(level: number) {
  return level * XP_PER_LEVEL;
}

export function useGamification() {
  const [data, setData] = useState<GamificationData>(loadData);
  const [newBadges, setNewBadges] = useState<string[]>([]);

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

      const updated: GamificationData = {
        ...prev,
        xp: newXP,
        level: newLevel,
        currentStreak: streak,
        longestStreak: Math.max(prev.longestStreak, streak),
        lastStudyDate: today,
        totalSessions: prev.totalSessions + 1,
      };

      const newlyUnlocked = checkBadges(updated);
      if (newlyUnlocked.length > 0) {
        updated.unlockedBadges = [...updated.unlockedBadges, ...newlyUnlocked];
        // We'll surface these via a separate state
        setTimeout(() => setNewBadges(newlyUnlocked), 0);
      }

      return updated;
    });
  }, []);

  const clearNewBadges = useCallback(() => setNewBadges([]), []);

  const xpInCurrentLevel = data.xp - (data.level > 1 ? xpForLevel(data.level - 1) : 0);
  const xpNeededForNext = xpForLevel(data.level) - (data.level > 1 ? xpForLevel(data.level - 1) : 0);
  const levelProgress = xpNeededForNext > 0 ? xpInCurrentLevel / xpNeededForNext : 0;

  const unlockedBadges = useMemo(
    () => ALL_BADGES.filter((b) => data.unlockedBadges.includes(b.id)),
    [data.unlockedBadges]
  );

  const lockedBadges = useMemo(
    () => ALL_BADGES.filter((b) => !data.unlockedBadges.includes(b.id)),
    [data.unlockedBadges]
  );

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

  const unlockItem = useCallback((itemId: string, cost: number) => {
    setData((prev) => {
      if (prev.xp >= cost && !prev.unlockedItems.includes(itemId)) {
        return {
          ...prev,
          xp: prev.xp - cost,
          unlockedItems: [...prev.unlockedItems, itemId],
        };
      }
      return prev;
    });
  }, []);

  const equipItem = useCallback((category: string, itemId: string | null) => {
    setData((prev) => {
      const newEquipped = { ...prev.equippedItems };
      if (itemId === null) {
        delete newEquipped[category];
      } else {
        newEquipped[category] = itemId;
      }
      return { ...prev, equippedItems: newEquipped };
    });
  }, []);

  return {
    ...data,
    xpInCurrentLevel,
    xpNeededForNext,
    levelProgress,
    awardSessionXP,
    getSubjectColor,
    setSubjectColor,
    unlockItem,
    equipItem,
    palette: PALETTE,
    unlockedBadges,
    lockedBadges,
    newBadges,
    clearNewBadges,
  };
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
