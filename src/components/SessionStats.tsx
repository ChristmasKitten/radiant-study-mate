import { motion } from "framer-motion";
import { BookOpen, Clock, Flame, Target } from "lucide-react";

interface SessionStatsProps {
  sessionsCompleted: number;
  totalFocusTime: number;
}

export function SessionStats({ sessionsCompleted, totalFocusTime }: SessionStatsProps) {
  const hours = Math.floor(totalFocusTime / 3600);
  const mins = Math.floor((totalFocusTime % 3600) / 60);

  const stats = [
    {
      icon: Target,
      label: "Sessions",
      value: sessionsCompleted,
      color: "text-primary",
    },
    {
      icon: Clock,
      label: "Focus Time",
      value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      color: "text-timer-warn",
    },
    {
      icon: Flame,
      label: "Streak",
      value: sessionsCompleted > 0 ? `${sessionsCompleted} 🔥` : "0",
      color: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center gap-1 rounded-xl bg-card border border-border p-4"
        >
          <stat.icon className={`h-4 w-4 ${stat.color}`} />
          <span className="font-mono text-lg font-bold text-foreground">{stat.value}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
