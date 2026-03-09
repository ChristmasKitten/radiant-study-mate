import { TimerMode } from "@/hooks/useStudyTimer";

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disableBreakModes?: boolean;
}

const modes: { key: TimerMode; label: string }[] = [
  { key: "focus", label: "Focus" },
  { key: "shortBreak", label: "Short Break" },
  { key: "longBreak", label: "Long Break" },
];

export function ModeSelector({ currentMode, onModeChange, disableBreakModes = false }: ModeSelectorProps) {
  const visibleModes = disableBreakModes ? modes.filter((mode) => mode.key === "focus") : modes;

  return (
    <div className="relative flex rounded-full bg-secondary p-1">
      {visibleModes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onModeChange(mode.key)}
          className={`rounded-full px-5 py-2 text-sm font-medium ${
            currentMode === mode.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
