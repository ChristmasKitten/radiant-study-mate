import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CustomDurations } from "@/hooks/useStudyTimer";
import { ColorTheme, COLOR_THEMES } from "@/hooks/useThemeToggle";
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
  colorTheme: ColorTheme;
  onColorChange: (c: ColorTheme) => void;
  disabled?: boolean;
}

export function SettingsPanel({ durations, onDurationsChange, colorTheme, onColorChange, disabled }: SettingsPanelProps) {
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
          <DialogTitle className="text-foreground">Settings</DialogTitle>
        </DialogHeader>

        {/* Color Theme */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Color Theme</label>
          <div className="grid grid-cols-6 gap-2">
            {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((key) => {
              const theme = COLOR_THEMES[key];
              const isActive = key === colorTheme;
              return (
                <button
                  key={key}
                  onClick={() => onColorChange(key)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all ${
                    isActive ? "bg-secondary ring-2 ring-primary" : "hover:bg-secondary/50"
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded-full shadow-sm"
                    style={{ backgroundColor: theme.preview }}
                  />
                  <span className="text-[9px] text-muted-foreground">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Durations */}
        <div className="space-y-4 pt-1">
          <label className="text-xs text-muted-foreground block">Session Durations</label>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Focus</span>
              <span className="font-mono text-xs text-primary font-bold">{local.focus} min</span>
            </div>
            <Slider
              value={[local.focus]}
              onValueChange={([v]) => setLocal((p) => ({ ...p, focus: v }))}
              min={5} max={90} step={5}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Short Break</span>
              <span className="font-mono text-xs text-timer-warn font-bold">{local.shortBreak} min</span>
            </div>
            <Slider
              value={[local.shortBreak]}
              onValueChange={([v]) => setLocal((p) => ({ ...p, shortBreak: v }))}
              min={1} max={30} step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Long Break</span>
              <span className="font-mono text-xs text-accent font-bold">{local.longBreak} min</span>
            </div>
            <Slider
              value={[local.longBreak]}
              onValueChange={([v]) => setLocal((p) => ({ ...p, longBreak: v }))}
              min={5} max={60} step={5}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full mt-1 rounded-lg" size="sm">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
