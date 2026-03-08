import { useState } from "react";
import { Clock, Flame, Target, Timer, BookOpen } from "lucide-react";
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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const viewing = selectedSubject ?? currentSubject;
  const isAll = viewing === "__all__";

  const viewSubjectTime = isAll
    ? {
        totalSeconds: subjectTimes.reduce((s, t) => s + t.totalSeconds, 0),
        sessions: subjectTimes.reduce((s, t) => s + t.sessions, 0),
      }
    : subjectTimes.find((s) => s.subject === viewing) ?? { totalSeconds: 0, sessions: 0 };

  const options = ["__all__", ...subjects];

  return (
    <div className="w-full max-w-md space-y-2.5">
      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/10 p-4">
        <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-[10px] uppercase tracking-widest text-primary/80">
                {isAll ? "All Subjects" : viewing}
              </p>
            </div>

            <select
              value={viewing}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-md border border-primary/20 bg-card/70 px-2 py-0.5 text-xs text-foreground outline-none"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "__all__" ? "All Subjects" : opt}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-primary/20 bg-card/70 p-3">
              <p className="font-mono text-base font-bold text-primary">
                {formatTime(viewSubjectTime.totalSeconds)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Focused</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-card/70 p-3">
              <p className="font-mono text-base font-bold text-primary">{viewSubjectTime.sessions}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sessions</p>
            </div>
          </div>
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
