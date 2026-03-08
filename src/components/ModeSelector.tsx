import { motion } from "framer-motion";
import { TimerMode } from "@/hooks/useStudyTimer";

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
}

const modes: { key: TimerMode; label: string }[] = [
  { key: "focus", label: "Focus" },
  { key: "shortBreak", label: "Short Break" },
  { key: "longBreak", label: "Long Break" },
];

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="relative flex rounded-full bg-secondary p-1">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onModeChange(mode.key)}
          className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            currentMode === mode.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {currentMode === mode.key && (
            <motion.div
              layoutId="mode-pill"
              className="absolute inset-0 rounded-full bg-primary"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          {mode.label}
        </button>
      ))}
    </div>
  );
}
