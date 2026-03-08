import { Clock, Flame, Target, Timer } from "lucide-react";
import { SubjectTime } from "@/hooks/useStudyTimer";

interface SessionStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number;
  allTimeTotalSeconds: number;
  bestDaySeconds: number;
  currentSubject: string;
  subjects: string[];
  subjectTimes: SubjectTime[];
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
  bestDaySeconds,
  currentSubject,
  subjects,
  subjectTimes,
}: SessionStatsProps) {
  const subjectTime = subjectTimes.find((s) => s.subject === currentSubject) ?? { totalSeconds: 0, sessions: 0 };

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
        <span className="text-xs font-medium text-primary">{currentSubject}</span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-foreground">{formatTime(subjectTime.totalSeconds)}</span>
          <span className="font-mono text-xs text-muted-foreground">{subjectTime.sessions} sessions</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Target, label: "Sessions", value: sessionsCompleted, color: "text-primary" },
          { icon: Clock, label: "Today", value: formatTime(totalFocusTime), color: "text-timer-warn" },
          { icon: Timer, label: "All Time", value: formatTime(allTimeTotalSeconds), color: "text-primary" },
          { icon: Flame, label: "Best Day", value: bestDaySeconds > 0 ? formatTime(bestDaySeconds) : "—", color: "text-destructive" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-3"
          >
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            <span className="text-center font-mono text-sm font-bold leading-none text-foreground">{stat.value}</span>
            <span className="text-center text-[9px] uppercase tracking-widest leading-none text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
