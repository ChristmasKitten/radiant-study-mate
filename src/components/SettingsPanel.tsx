import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CustomDurations } from "@/hooks/useStudyTimer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setLocal(durations); }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Session Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
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

        <Button onClick={handleSave} className="w-full mt-2 rounded-lg" size="sm">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
