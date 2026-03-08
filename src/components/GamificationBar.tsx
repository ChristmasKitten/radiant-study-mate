import { useState } from "react";
import { Flame, Star, Trophy, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-secondary"
          aria-label="Level details"
        >
          <Star className="h-3 w-3 text-primary" />
          <span>Lv {level}</span>
          {currentStreak > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <Flame className="h-3 w-3 text-destructive" />
              <span className="font-mono">{currentStreak}</span>
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{xp} XP total</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Trophy className="h-3 w-3 text-timer-warn" />
            <span className="font-mono text-foreground">{longestStreak}</span>
          </span>
        </div>

        <div className="mb-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(levelProgress * 100, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-primary" />
            {xpInCurrentLevel} / {xpNeededForNext} XP
          </span>
          <span>Next Lv {level + 1}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
