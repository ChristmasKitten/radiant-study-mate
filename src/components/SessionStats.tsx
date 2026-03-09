import { BookOpen } from "lucide-react";
import { Clock, Flame, Target, Timer } from "lucide-react";
import { SubjectTime } from "@/hooks/useStudyTimer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SessionStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number;
  allTimeTotalSeconds: number;
  bestDaySeconds: number;
  currentSubject: string;
  subjects: string[];
  subjectTimes: SubjectTime[];
  currentStreak: number;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function SessionStats({
  sessionsCompleted,
  totalFocusTime,
  allTimeTotalSeconds,
  currentSubject,
  subjectTimes,
  currentStreak,
}: SessionStatsProps) {
  const subjectTime = subjectTimes.find((s) => s.subject === currentSubject) ?? { totalSeconds: 0, sessions: 0 };

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">{currentSubject}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-xs font-bold text-foreground">{formatTime(subjectTime.totalSeconds)}</p>
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Focused</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs font-bold text-foreground">{subjectTime.sessions}</p>
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Sessions</p>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { icon: Flame, label: "Streak", value: currentStreak > 0 ? `${currentStreak}d` : "—", color: "text-destructive", tooltip: "Active daily streak" },
            { icon: Clock, label: "Today", value: formatTime(totalFocusTime), color: "text-timer-warn", tooltip: bestDaySeconds > 0 ? `Best day: ${formatTime(bestDaySeconds)}` : "Focus time today" },
            { icon: Timer, label: "All Time", value: formatTime(allTimeTotalSeconds), color: "text-primary", tooltip: "Total focus time" },
            { icon: Target, label: "Sessions", value: sessionsCompleted, color: "text-primary", tooltip: "Sessions completed today" },
          ].map((stat) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-card p-2 cursor-help hover:bg-accent/5 transition-colors">
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  <span className="text-center font-mono text-xs font-bold leading-none text-foreground">{stat.value}</span>
                  <span className="text-center text-[8px] uppercase tracking-widest leading-none text-muted-foreground">{stat.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
