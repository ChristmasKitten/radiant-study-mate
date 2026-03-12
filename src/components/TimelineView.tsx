import { useMemo } from "react";
import { Clock } from "lucide-react";
import { SubjectTime } from "@/hooks/useStudyTimer";

interface TimelineViewProps {
  totalFocusTime: number;
  subjectTimes: SubjectTime[];
  getSubjectColor: (subject: string) => string;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function TimelineView({ totalFocusTime, subjectTimes, getSubjectColor }: TimelineViewProps) {
  const sortedSubjects = useMemo(
    () => [...subjectTimes].filter((s) => s.totalSeconds > 0).sort((a, b) => b.totalSeconds - a.totalSeconds),
    [subjectTimes]
  );

  if (sortedSubjects.length === 0) {
    return (
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 my-[9px]">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Where Did My Time Go?</p>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">Start studying to see your time breakdown!</p>
      </div>);

  }

  const totalSec = Math.max(totalFocusTime, sortedSubjects.reduce((s, t) => s + t.totalSeconds, 0), 1);

  // Create hour blocks for today's timeline
  const now = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = now.getHours();

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Where Did My Time Go?</p>
        </div>
        <span className="text-xs font-mono font-bold text-foreground">{formatTime(totalSec)}</span>
      </div>

      {/* Subject breakdown bars */}
      <div className="space-y-2">
        {sortedSubjects.map((st) => {
          const pct = st.totalSeconds / totalSec * 100;
          const color = getSubjectColor(st.subject);
          const isNone = color === "none";
          return (
            <div key={st.subject} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isNone && <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />}
                  <span className="text-xs font-medium text-foreground">{st.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{Math.round(pct)}%</span>
                  <span className="text-xs font-mono font-bold text-foreground">{formatTime(st.totalSeconds)}</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isNone ? "hsl(var(--primary))" : color,
                    opacity: 0.7
                  }} />
                
              </div>
            </div>);

        })}
      </div>

      {/* Mini hour timeline */}
      <div>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Today's Timeline</p>
        <div className="flex gap-px">
          {hours.map((h) => {
            const isPast = h < currentHour;
            const isCurrent = h === currentHour;
            return (
              <div
                key={h}
                className={`flex-1 h-4 rounded-sm transition-colors ${
                isCurrent ? "bg-primary/60 ring-1 ring-primary" : isPast ? "bg-secondary" : "bg-secondary/30"}`
                }
                title={`${String(h).padStart(2, "0")}:00`} />);


          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-muted-foreground">00:00</span>
          <span className="text-[8px] text-muted-foreground">12:00</span>
          <span className="text-[8px] text-muted-foreground">23:00</span>
        </div>
      </div>

      {/* Sessions count */}
      <div className="flex items-center justify-center gap-4 pt-1 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{sortedSubjects.reduce((s, t) => s + t.sessions, 0)}</p>
          <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{sortedSubjects.length}</p>
          <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Subjects</p>
        </div>
      </div>
    </div>);

}