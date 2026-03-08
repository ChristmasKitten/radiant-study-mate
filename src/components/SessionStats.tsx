import { motion } from "framer-motion";
import { Clock, Flame, Target, Timer } from "lucide-react";
import { SubjectTime } from "@/hooks/useStudyTimer";

interface SessionStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number;
  allTimeTotalSeconds: number;
  subjectTimes: SubjectTime[];
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function SessionStats({ sessionsCompleted, totalFocusTime, allTimeTotalSeconds, subjectTimes }: SessionStatsProps) {
  const stats = [
    {
      icon: Target,
      label: "Sessions",
      value: sessionsCompleted,
      color: "text-primary",
    },
    {
      icon: Clock,
      label: "Today",
      value: formatTime(totalFocusTime),
      color: "text-timer-warn",
    },
    {
      icon: Timer,
      label: "All Time",
      value: formatTime(allTimeTotalSeconds),
      color: "text-primary",
    },
    {
      icon: Flame,
      label: "Streak",
      value: sessionsCompleted > 0 ? `${sessionsCompleted} 🔥` : "0",
      color: "text-destructive",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="grid grid-cols-4 gap-2 w-full">
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

      {/* Subject breakdown */}
      {subjectTimes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full rounded-xl bg-card border border-border p-4"
        >
          <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Subject Breakdown</p>
          <div className="space-y-2">
            {subjectTimes
              .sort((a, b) => b.totalSeconds - a.totalSeconds)
              .map((st) => {
                const pct = allTimeTotalSeconds > 0 ? (st.totalSeconds / allTimeTotalSeconds) * 100 : 0;
                return (
                  <div key={st.subject} className="flex items-center gap-3">
                    <span className="w-20 truncate text-xs font-medium text-foreground">{st.subject}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground w-14 text-right">
                      {formatTime(st.totalSeconds)}
                    </span>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
