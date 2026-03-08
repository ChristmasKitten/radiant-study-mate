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
  const glowColor = isFocus ? "var(--primary)" : mode === "shortBreak" ? "var(--timer-warn)" : "var(--accent)";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute rounded-full transition-opacity duration-700"
        style={{
          width: size + 30,
          height: size + 30,
          background: `radial-gradient(circle, hsl(${glowColor} / 0.15) 0%, transparent 70%)`,
          opacity: isRunning ? 1 : 0.3,
        }}
      />

      <svg width={size} height={size} className="relative transform -rotate-90">
        {/* Glow filter */}
        <defs>
          <filter id="timer-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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
          filter="url(#timer-glow)"
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <span className={`font-mono text-6xl font-bold tracking-wider ${colorClass}`}>
          {formatted}
        </span>
        <span className="mt-1.5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {mode === "focus" ? "Focus" : mode === "shortBreak" ? "Short Break" : "Long Break"}
        </span>
        {timeLeft > 0 && (
          <span className="mt-1 font-mono text-[10px] text-muted-foreground/60">
            ends at {getEndTime(timeLeft)}
          </span>
        )}
      </div>

      {/* Breathing pulse when running */}
      {isRunning && (
        <div
          className="absolute rounded-full border border-primary/20"
          style={{
            width: size + 16,
            height: size + 16,
            animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}
    </div>
  );
}
