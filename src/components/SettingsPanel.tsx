import { useState } from "react";
import { Settings, Cat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
  catVisible: boolean;
  onCatToggle: (v: boolean) => void;
  dailyGoal: number;
  onDailyGoalChange: (g: number) => void;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export function SettingsPanel({ durations, onDurationsChange, colorTheme, onColorChange, disabled, catVisible, onCatToggle, dailyGoal, onDailyGoalChange, open: controlledOpen, onOpenChange: controlledOnOpenChange }: SettingsPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [local, setLocal] = useState(durations);
  const [localGoal, setLocalGoal] = useState(dailyGoal);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleSave = () => {
    onDurationsChange(local);
    onDailyGoalChange(localGoal);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setLocal(durations); setLocalGoal(dailyGoal); } }}>
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

        {/* Daily Goal */}
        <div className="pt-1">
          <label className="text-xs text-muted-foreground block mb-2">Daily Goal</label>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Focus Time</span>
            <span className="font-mono text-xs text-primary font-bold">{localGoal} min</span>
          </div>
          <Slider
            value={[localGoal]}
            onValueChange={([v]) => setLocalGoal(v)}
            min={10} max={600} step={10}
          />
        </div>

        {/* Cat toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Cat className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Study Cat</span>
          </div>
          <Switch checked={catVisible} onCheckedChange={onCatToggle} />
        </div>

        <Button onClick={handleSave} className="w-full mt-1 rounded-lg" size="sm">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
