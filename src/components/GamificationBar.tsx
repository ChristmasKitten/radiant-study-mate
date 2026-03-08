import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Star, Trophy, Zap } from "lucide-react";
import { xpForLevel } from "@/hooks/useGamification";

interface GamificationBarProps {
  xp: number;
  level: number;
  levelProgress: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  currentStreak: number;
  longestStreak: number;
}

export function GamificationBar({
  xp,
  level,
  levelProgress,
  xpInCurrentLevel,
  xpNeededForNext,
  currentStreak,
  longestStreak,
}: GamificationBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Compact badge - always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
      >
        <Star className="h-3 w-3 text-primary" />
        <span className="font-bold text-foreground">Lv {level}</span>
        {currentStreak > 0 && (
          <>
            <span className="text-muted-foreground">•</span>
            <Flame className="h-3 w-3 text-destructive" />
            <span className="font-mono font-bold text-foreground">{currentStreak}</span>
          </>
        )}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-xs overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{xp} XP total</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1" title="Best streak">
                    <Trophy className="h-3 w-3 text-timer-warn" />
                    <span className="font-mono font-bold text-foreground">{longestStreak}</span>
                  </div>
                </div>
              </div>

              {/* XP progress bar */}
              <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(levelProgress * 100, 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5 text-primary" />
                  {xpInCurrentLevel} / {xpNeededForNext} XP
                </span>
                <span>Next: Lv {level + 1}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
