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
    <div className="flex flex-col gap-2 w-full max-w-md">
      {/* Compact current subject inline */}
      <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2">
        <BookOpen className="h-3 w-3 text-primary shrink-0" />
        <span className="text-xs font-medium text-foreground truncate">{currentSubject}</span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="font-mono text-xs font-bold text-primary">
          {currentSubjectTime ? formatTime(currentSubjectTime.totalSeconds) : "0m"}
        </span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="font-mono text-xs text-muted-foreground">
          {currentSubjectTime?.sessions ?? 0} sess
        </span>
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
