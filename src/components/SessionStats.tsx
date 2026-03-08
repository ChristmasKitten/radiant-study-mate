import { Clock, Flame, Timer, BookOpen } from "lucide-react";
import { SubjectTime } from "@/hooks/useStudyTimer";

interface SessionStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number;
  allTimeTotalSeconds: number;
  bestDaySeconds: number;
  currentSubject: string;
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
  subjectTimes,
}: SessionStatsProps) {
  const currentSubjectTime = subjectTimes.find((s) => s.subject === currentSubject);

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Current Subject
        </div>

        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-semibold text-foreground">{currentSubject}</p>
          <p className="font-mono text-xs text-muted-foreground">{currentSubjectTime?.sessions ?? 0} sessions</p>
        </div>

        <p className="mt-1 font-mono text-lg font-bold text-primary">
          {currentSubjectTime ? formatTime(currentSubjectTime.totalSeconds) : "0m"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Clock className="h-3 w-3 text-timer-warn" /> Today
          </p>
          <p className="font-mono text-sm font-bold text-foreground">{formatTime(totalFocusTime)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Timer className="h-3 w-3 text-primary" /> All Time
          </p>
          <p className="font-mono text-sm font-bold text-foreground">{formatTime(allTimeTotalSeconds)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Sessions</p>
          <p className="font-mono text-sm font-bold text-foreground">{sessionsCompleted}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Flame className="h-3 w-3 text-destructive" /> Best Day
          </p>
          <p className="font-mono text-sm font-bold text-foreground">{bestDaySeconds > 0 ? formatTime(bestDaySeconds) : "—"}</p>
        </div>
      </div>
    </div>
  );
}
