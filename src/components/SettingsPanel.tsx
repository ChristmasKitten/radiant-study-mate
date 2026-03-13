import { useState, useRef } from "react";
import { Settings, Cat, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CustomDurations } from "@/hooks/useStudyTimer";
import { ColorTheme, COLOR_THEMES } from "@/hooks/useThemeToggle";
import { toast } from "@/hooks/use-toast";
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
  onSkiGame?: () => void;
  unlockedItems?: string[];
}

const SHOP_THEME_MAP: Record<string, string> = {
  neon: "theme_neon",
  ocean: "theme_ocean",
  sunset: "theme_sunset",
};

function getStorageData() {
  const keys = ["studyflow_data", "studyflow_tasks", "studyflow_schedule", "studyflow_gamification"];
  return keys.map((key) => {
    try {
      const raw = localStorage.getItem(key);
      return { key, data: raw ? JSON.parse(raw) : null };
    } catch { return { key, data: null }; }
  });
}

function exportAllJSON() {
  const allData: Record<string, any> = {};
  const keys = ["studyflow_data", "studyflow_tasks", "studyflow_schedule", "studyflow_gamification"];
  keys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) allData[key] = JSON.parse(raw);
    } catch {}
  });
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pomidor-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSVs() {
  const stores = getStorageData();
  const studyData = stores.find((s) => s.key === "studyflow_data")?.data;
  const tasks = stores.find((s) => s.key === "studyflow_tasks")?.data;
  const schedule = stores.find((s) => s.key === "studyflow_schedule")?.data;
  let exported = 0;

  if (studyData?.dailyRecords?.length) {
    const header = "Date,Total Seconds,Sessions";
    const rows = studyData.dailyRecords.map((r: any) => `${r.date},${r.totalSeconds},${r.sessions}`);
    downloadCSV("pomidor-sessions.csv", [header, ...rows].join("\n"));
    exported++;
  }
  if (studyData?.subjectTimes?.length) {
    const header = "Subject,Total Seconds,Sessions";
    const rows = studyData.subjectTimes.map((s: any) => `${s.subject},${s.totalSeconds},${s.sessions}`);
    downloadCSV("pomidor-subjects.csv", [header, ...rows].join("\n"));
    exported++;
  }
  if (tasks?.length) {
    const header = "Subject,Task,Completed,Created At";
    const rows = tasks.map((t: any) => `"${t.subject}","${t.text}",${t.completed},${new Date(t.createdAt).toISOString()}`);
    downloadCSV("pomidor-tasks.csv", [header, ...rows].join("\n"));
    exported++;
  }
  if (schedule?.length) {
    const header = "Subject,Day,Start Time,End Time,Repeating";
    const rows = schedule.map((b: any) => `"${b.subject}",${b.day},${b.startTime},${b.endTime},${b.repeating}`);
    downloadCSV("pomidor-schedule.csv", [header, ...rows].join("\n"));
    exported++;
  }

  if (exported === 0) {
    toast({ title: "No data to export", description: "Start studying to generate data!" });
  } else {
    toast({ title: "📊 Exported!", description: `Downloaded ${exported} CSV file(s).` });
  }
}

export function SettingsPanel({ durations, onDurationsChange, colorTheme, onColorChange, disabled, catVisible, onCatToggle, dailyGoal, onDailyGoalChange, open: controlledOpen, onOpenChange: controlledOnOpenChange, onSkiGame }: SettingsPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [local, setLocal] = useState(durations);
  const [localGoal, setLocalGoal] = useState(dailyGoal);
  const fileRef = useRef<HTMLInputElement>(null);
  const [catClicks, setCatClicks] = useState(0);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleSave = () => {
    onDurationsChange(local);
    onDailyGoalChange(localGoal);
    setOpen(false);
  };

  const handleCatIconClick = () => {
    const next = catClicks + 1;
    setCatClicks(next);
    if (next >= 5 && onSkiGame) {
      setCatClicks(0);
      setOpen(false);
      onSkiGame();
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        let restored = 0;
        const validKeys = ["studyflow_data", "studyflow_tasks", "studyflow_schedule", "studyflow_gamification"];
        validKeys.forEach((key) => {
          if (data[key]) { localStorage.setItem(key, JSON.stringify(data[key])); restored++; }
        });
        if (restored > 0) {
          toast({ title: "✅ Imported!", description: `Restored ${restored} data store(s). Refreshing...` });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({ title: "No valid data found", description: "The file doesn't contain Pomidor backup data." });
        }
      } catch {
        toast({ title: "Import failed", description: "Invalid JSON file." });
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.trim().split("\n");
        if (lines.length < 2) throw new Error("Empty CSV");
        const header = lines[0].toLowerCase();
        
        if (header.includes("date") && header.includes("total seconds")) {
          // Import daily records
          const records = lines.slice(1).map(line => {
            const [date, totalSeconds, sessions] = line.split(",");
            return { date: date.trim(), totalSeconds: parseInt(totalSeconds), sessions: parseInt(sessions) };
          }).filter(r => r.date && !isNaN(r.totalSeconds));
          
          const raw = localStorage.getItem("studyflow_data");
          const data = raw ? JSON.parse(raw) : {};
          const existing: any[] = data.dailyRecords || [];
          records.forEach(r => {
            const idx = existing.findIndex((e: any) => e.date === r.date);
            if (idx >= 0) {
              existing[idx].totalSeconds += r.totalSeconds;
              existing[idx].sessions += r.sessions;
            } else {
              existing.push(r);
            }
          });
          data.dailyRecords = existing;
          localStorage.setItem("studyflow_data", JSON.stringify(data));
          toast({ title: "✅ CSV Imported!", description: `Imported ${records.length} daily records. Refreshing...` });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({ title: "Unsupported CSV format", description: "Use a Pomidor-exported CSV file." });
        }
      } catch {
        toast({ title: "Import failed", description: "Invalid CSV file." });
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setLocal(durations); setLocalGoal(dailyGoal); setCatClicks(0); } }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground" disabled={disabled}>
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-card border-border max-h-[85vh] overflow-y-auto">
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
                  <div className="h-6 w-6 rounded-full shadow-sm" style={{ backgroundColor: theme.preview }} />
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
            <Slider value={[local.focus]} onValueChange={([v]) => setLocal((p) => ({ ...p, focus: v }))} min={5} max={90} step={5} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Short Break</span>
              <span className="font-mono text-xs text-timer-warn font-bold">{local.shortBreak} min</span>
            </div>
            <Slider value={[local.shortBreak]} onValueChange={([v]) => setLocal((p) => ({ ...p, shortBreak: v }))} min={1} max={30} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Long Break</span>
              <span className="font-mono text-xs text-accent font-bold">{local.longBreak} min</span>
            </div>
            <Slider value={[local.longBreak]} onValueChange={([v]) => setLocal((p) => ({ ...p, longBreak: v }))} min={5} max={60} step={5} />
          </div>
        </div>

        {/* Daily Goal */}
        <div className="pt-1">
          <label className="text-xs text-muted-foreground block mb-2">Daily Goal</label>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground">Focus Time</span>
            <span className="font-mono text-xs text-primary font-bold">{localGoal} min</span>
          </div>
          <Slider value={[localGoal]} onValueChange={([v]) => setLocalGoal(v)} min={10} max={600} step={10} />
        </div>

        {/* Cat toggle - click icon 5x for skiing easter egg */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleCatIconClick}>
            <Cat className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Study Cat</span>
            {catClicks > 0 && catClicks < 5 && <span className="text-[9px] text-muted-foreground/40">{5 - catClicks}...</span>}
          </div>
          <Switch checked={catVisible} onCheckedChange={onCatToggle} />
        </div>

        {/* Import / Export */}
        <div className="pt-2 border-t border-border space-y-2">
          <label className="text-xs text-muted-foreground block">Data</label>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => exportCSVs()}>
              <Download className="mr-1 h-3 w-3" /> Export CSV
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => exportAllJSON()}>
              <Download className="mr-1 h-3 w-3" /> Backup JSON
            </Button>
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" id="csv-import-input" />
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1 h-3 w-3" /> Import JSON
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => document.getElementById("csv-import-input")?.click()}>
              <Upload className="mr-1 h-3 w-3" /> Import CSV
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full mt-1 rounded-lg" size="sm">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
