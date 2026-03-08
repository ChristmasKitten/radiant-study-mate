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
    {
      icon: BookOpen,
      label: currentSubject.length > 10 ? `${currentSubject.slice(0, 10)}…` : currentSubject,
      value: currentSubjectTime ? formatTime(currentSubjectTime.totalSeconds) : "0m",
      subValue: `${currentSubjectTime?.sessions ?? 0} sess`,
      color: "text-primary",
    },
    { icon: Target, label: "Sessions", value: sessionsCompleted, color: "text-primary" },
    { icon: Clock, label: "Today", value: formatTime(totalFocusTime), color: "text-timer-warn" },
    { icon: Timer, label: "All Time", value: formatTime(allTimeTotalSeconds), color: "text-primary" },
    { icon: Flame, label: "Best Day", value: bestDaySeconds > 0 ? formatTime(bestDaySeconds) : "—", color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-md">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-xl bg-card border border-border p-3"
        >
          <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
          <span className="font-mono text-sm font-bold text-foreground text-center leading-none">{stat.value}</span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground text-center leading-none">{stat.label}</span>
          {"subValue" in stat && stat.subValue && (
            <span className="text-[9px] text-muted-foreground/80 leading-none">{stat.subValue}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
