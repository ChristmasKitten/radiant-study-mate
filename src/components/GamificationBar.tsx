import { useState, useEffect } from "react";
import { Flame, Star, Trophy, Zap, Award } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge as BadgeType } from "@/hooks/useGamification";
import { toast } from "@/hooks/use-toast";

interface GamificationBarProps {
  xp: number;
  level: number;
  levelProgress: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  unlockedBadges: BadgeType[];
  lockedBadges: BadgeType[];
  newBadges: string[];
  onClearNewBadges: () => void;
}

export function GamificationBar({
  xp,
  level,
  levelProgress,
  xpInCurrentLevel,
  xpNeededForNext,
  currentStreak,
  longestStreak,
  totalSessions,
  unlockedBadges,
  lockedBadges,
  newBadges,
  onClearNewBadges,
}: GamificationBarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (newBadges.length > 0) {
      newBadges.forEach((id) => {
        const badge = [...unlockedBadges, ...lockedBadges].find((b) => b.id === id);
        if (badge) {
          toast({ title: `${badge.emoji} Badge Unlocked!`, description: badge.name });
        }
      });
      onClearNewBadges();
    }
  }, [newBadges, unlockedBadges, lockedBadges, onClearNewBadges]);

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

      <PopoverContent align="end" className="w-72 border-border bg-card p-3">
        {/* Stats */}
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{xp} XP total</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Trophy className="h-3 w-3 text-timer-warn" />
            <span className="font-mono text-foreground">{longestStreak} best</span>
          </span>
        </div>

        {/* XP progress */}
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(levelProgress * 100, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-primary" />
            {xpInCurrentLevel} / {xpNeededForNext} XP
          </span>
          <span>Next Lv {level + 1}</span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-xs font-bold text-foreground">{totalSessions}</p>
            <p className="text-[9px] text-muted-foreground">Sessions</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-xs font-bold text-foreground">{currentStreak}</p>
            <p className="text-[9px] text-muted-foreground">Streak</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-xs font-bold text-foreground">{unlockedBadges.length}</p>
            <p className="text-[9px] text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1 mb-2">
          <Award className="h-3 w-3 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Badges</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
          {unlockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-0.5 rounded-lg bg-primary/10 p-1.5"
              title={`${badge.name}: ${badge.description}`}
            >
              <span className="text-base">{badge.emoji}</span>
              <span className="text-[8px] text-foreground text-center leading-tight truncate w-full">{badge.name}</span>
            </div>
          ))}
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-0.5 rounded-lg bg-secondary p-1.5 opacity-40"
              title={badge.description}
            >
              <span className="text-base grayscale">🔒</span>
              <span className="text-[8px] text-muted-foreground text-center leading-tight truncate w-full">{badge.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
