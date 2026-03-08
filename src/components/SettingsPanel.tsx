import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CustomDurations } from "@/hooks/useStudyTimer";

interface SettingsPanelProps {
  durations: CustomDurations;
  onDurationsChange: (d: CustomDurations) => void;
  disabled?: boolean;
}

export function SettingsPanel({ durations, onDurationsChange, disabled }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(durations);

  const handleSave = () => {
    onDurationsChange(local);
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setLocal(durations);
          setOpen(true);
        }}
        className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
        disabled={disabled}
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-72 rounded-xl bg-card border border-border p-5 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Session Settings</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs text-muted-foreground">Focus Duration</label>
            <span className="font-mono text-xs text-primary font-bold">{local.focus} min</span>
          </div>
          <Slider
            value={[local.focus]}
            onValueChange={([v]) => setLocal((p) => ({ ...p, focus: v }))}
            min={5}
            max={90}
            step={5}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs text-muted-foreground">Short Break</label>
            <span className="font-mono text-xs text-timer-warn font-bold">{local.shortBreak} min</span>
          </div>
          <Slider
            value={[local.shortBreak]}
            onValueChange={([v]) => setLocal((p) => ({ ...p, shortBreak: v }))}
            min={1}
            max={30}
            step={1}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs text-muted-foreground">Long Break</label>
            <span className="font-mono text-xs text-accent font-bold">{local.longBreak} min</span>
          </div>
          <Slider
            value={[local.longBreak]}
            onValueChange={([v]) => setLocal((p) => ({ ...p, longBreak: v }))}
            min={5}
            max={60}
            step={5}
          />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full mt-5 rounded-lg" size="sm">
        Save Settings
      </Button>
    </motion.div>
  );
}
