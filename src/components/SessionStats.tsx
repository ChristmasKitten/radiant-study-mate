import { motion } from "framer-motion";
import { Clock, Flame, Target, Timer, BookOpen } from "lucide-react";
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

  const stats = [
    { icon: Target, label: "Sessions", value: sessionsCompleted, color: "text-primary" },
    { icon: Clock, label: "Today", value: formatTime(totalFocusTime), color: "text-timer-warn" },
    { icon: Timer, label: "All Time", value: formatTime(allTimeTotalSeconds), color: "text-primary" },
    { icon: Flame, label: "Best Day", value: bestDaySeconds > 0 ? formatTime(bestDaySeconds) : "—", color: "text-destructive" },
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      {/* Current subject stats */}
      <div className="rounded-xl bg-card border border-border p-3">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-3 w-3 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{currentSubject}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-lg font-bold text-foreground">
              {currentSubjectTime ? formatTime(currentSubjectTime.totalSeconds) : "0m"}
            </span>
            <span className="text-[9px] text-muted-foreground">Time studied</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col">
            <span className="font-mono text-lg font-bold text-foreground">
              {currentSubjectTime?.sessions ?? 0}
            </span>
            <span className="text-[9px] text-muted-foreground">Sessions</span>
          </div>
          {subjectTimes.length > 1 && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-1 gap-1 overflow-hidden">
                {subjectTimes
                  .sort((a, b) => b.totalSeconds - a.totalSeconds)
                  .slice(0, 3)
                  .map((st) => (
                    <div
                      key={st.subject}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-medium truncate ${
                        st.subject === currentSubject
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {st.subject}: {formatTime(st.totalSeconds)}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* General stats */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-1 rounded-xl bg-card border border-border p-3"
          >
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            <span className="font-mono text-base font-bold text-foreground">{stat.value}</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
