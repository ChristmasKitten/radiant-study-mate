import { TimerMode } from "@/hooks/useStudyTimer";

interface CircularTimerProps {
  timeLeft: number;
  progress: number;
  mode: TimerMode;
  isRunning: boolean;
}

function getEndTime(secondsLeft: number): string {
  const end = new Date(Date.now() + secondsLeft * 1000);
  return end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function CircularTimer({ timeLeft, progress, mode, isRunning }: CircularTimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const size = 300;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const isFocus = mode === "focus";
  const colorClass = isFocus ? "text-primary" : mode === "shortBreak" ? "text-timer-warn" : "text-accent";
  const strokeColor = isFocus ? "hsl(var(--primary))" : mode === "shortBreak" ? "hsl(var(--timer-warn))" : "hsl(var(--accent))";

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="relative transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          opacity={0.5}
        />

        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
    </div>
  );
}
