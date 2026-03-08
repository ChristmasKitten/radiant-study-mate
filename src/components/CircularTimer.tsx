import { motion } from "framer-motion";
import { TimerMode } from "@/hooks/useStudyTimer";

interface CircularTimerProps {
  timeLeft: number;
  progress: number;
  mode: TimerMode;
  isRunning: boolean;
}

export function CircularTimer({ timeLeft, progress, mode, isRunning }: CircularTimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const size = 280;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const isFocus = mode === "focus";
  const colorClass = isFocus ? "text-primary" : mode === "shortBreak" ? "text-timer-warn" : "text-accent";

  const strokeColor = isFocus ? "hsl(var(--primary))" : "hsl(var(--timer-warn))";
  const glowShadow = isFocus
    ? "0 0 30px hsl(var(--timer-glow) / 0.4)"
    : "0 0 30px hsl(var(--timer-warn) / 0.4)";

  return (
    <div className="relative flex items-center justify-center">
      {isRunning && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: size + 40, height: size + 40, boxShadow: glowShadow }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <motion.span
          className={`font-mono text-6xl font-bold tracking-wider ${colorClass}`}
          key={formatted}
          initial={{ scale: 1 }}
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
        >
          {formatted}
        </motion.span>
        <span className="mt-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {mode === "focus" ? "Focus" : mode === "shortBreak" ? "Short Break" : "Long Break"}
        </span>
      </div>
    </div>
  );
}
