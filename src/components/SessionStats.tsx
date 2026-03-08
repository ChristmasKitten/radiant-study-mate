import { motion } from "framer-motion";
import { Clock, Flame, Target, Timer } from "lucide-react";

interface SessionStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number;
  allTimeTotalSeconds: number;
  bestDaySeconds: number;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function SessionStats({ sessionsCompleted, totalFocusTime, allTimeTotalSeconds, bestDaySeconds }: SessionStatsProps) {
  const stats = [
    { icon: Target, label: "Sessions", value: sessionsCompleted, color: "text-primary" },
    { icon: Clock, label: "Today", value: formatTime(totalFocusTime), color: "text-timer-warn" },
    { icon: Timer, label: "All Time", value: formatTime(allTimeTotalSeconds), color: "text-primary" },
    { icon: Flame, label: "Best Day", value: bestDaySeconds > 0 ? formatTime(bestDaySeconds) : "—", color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-md">
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
  );
}
