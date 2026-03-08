import { motion } from "framer-motion";
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
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Star className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Level {level}</p>
            <p className="text-[10px] text-muted-foreground">{xp} XP total</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Current streak">
            <Flame className="h-3.5 w-3.5 text-destructive" />
            <span className="font-mono text-xs font-bold text-foreground">{currentStreak}</span>
          </div>
          <div className="flex items-center gap-1" title="Best streak">
            <Trophy className="h-3.5 w-3.5 text-timer-warn" />
            <span className="font-mono text-xs font-bold text-foreground">{longestStreak}</span>
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(levelProgress * 100, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary-foreground drop-shadow-sm">
            {xpInCurrentLevel} / {xpNeededForNext} XP
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="h-2.5 w-2.5 text-primary" />
          +50 XP per session {currentStreak > 1 && `• +${20 * Math.min(currentStreak, 10)} streak bonus`}
        </span>
        <span>Next: Lv{level + 1}</span>
      </div>
    </div>
  );
}
