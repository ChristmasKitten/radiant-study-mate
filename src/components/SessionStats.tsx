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

  return (
    <div className="w-full max-w-md space-y-2">
      {/* Subject-specific highlighted card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {currentSubject.length > 16 ? `${currentSubject.slice(0, 16)}…` : currentSubject}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-primary">
              {currentSubjectTime ? formatTime(currentSubjectTime.totalSeconds) : "0m"}
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-muted-foreground">
              {currentSubjectTime?.sessions ?? 0} sessions
            </span>
          </div>
        </div>
      </motion.div>

      {/* General stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Target, label: "Sessions", value: sessionsCompleted, color: "text-primary" },
          { icon: Clock, label: "Today", value: formatTime(totalFocusTime), color: "text-timer-warn" },
          { icon: Timer, label: "All Time", value: formatTime(allTimeTotalSeconds), color: "text-primary" },
          { icon: Flame, label: "Best Day", value: bestDaySeconds > 0 ? formatTime(bestDaySeconds) : "—", color: "text-destructive" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-card border border-border p-3"
          >
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            <span className="font-mono text-sm font-bold text-foreground text-center leading-none">{stat.value}</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground text-center leading-none">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
