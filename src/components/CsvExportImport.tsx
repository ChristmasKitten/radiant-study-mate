import { useState, useRef } from "react";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

function getStorageData() {
  const keys = [
    { key: "studyflow_data", label: "Study Sessions" },
    { key: "studyflow_tasks", label: "Tasks" },
    { key: "studyflow_schedule", label: "Schedule" },
    { key: "studyflow_gamification", label: "Gamification" },
  ];
  return keys.map(({ key, label }) => {
    try {
      const raw = localStorage.getItem(key);
      return { key, label, data: raw ? JSON.parse(raw) : null };
    } catch {
      return { key, label, data: null };
    }
  });
}

function sessionsToCSV(data: any): string {
  if (!data?.dailyRecords?.length) return "";
  const header = "Date,Total Seconds,Sessions";
  const rows = data.dailyRecords.map((r: any) => `${r.date},${r.totalSeconds},${r.sessions}`);
  return [header, ...rows].join("\n");
}

function subjectsToCSV(data: any): string {
  if (!data?.subjectTimes?.length) return "";
  const header = "Subject,Total Seconds,Sessions";
  const rows = data.subjectTimes.map((s: any) => `${s.subject},${s.totalSeconds},${s.sessions}`);
  return [header, ...rows].join("\n");
}

function tasksToCSV(tasks: any[]): string {
  if (!tasks?.length) return "";
  const header = "Subject,Task,Completed,Created At";
  const rows = tasks.map((t: any) => `"${t.subject}","${t.text}",${t.completed},${new Date(t.createdAt).toISOString()}`);
  return [header, ...rows].join("\n");
}

function scheduleToCSV(blocks: any[]): string {
  if (!blocks?.length) return "";
  const header = "Subject,Day,Start Time,End Time,Repeating";
  const rows = blocks.map((b: any) => `"${b.subject}",${b.day},${b.startTime},${b.endTime},${b.repeating}`);
  return [header, ...rows].join("\n");
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

export function CsvExportImport() {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    const stores = getStorageData();
    const studyData = stores.find((s) => s.key === "studyflow_data")?.data;
    const tasks = stores.find((s) => s.key === "studyflow_tasks")?.data;
    const schedule = stores.find((s) => s.key === "studyflow_schedule")?.data;

    let exported = 0;
    const sessions = sessionsToCSV(studyData);
    if (sessions) { downloadCSV("pomidor-sessions.csv", sessions); exported++; }

    const subjects = subjectsToCSV(studyData);
    if (subjects) { downloadCSV("pomidor-subjects.csv", subjects); exported++; }

    const tasksCsv = tasksToCSV(tasks);
    if (tasksCsv) { downloadCSV("pomidor-tasks.csv", tasksCsv); exported++; }

    const scheduleCsv = scheduleToCSV(schedule);
    if (scheduleCsv) { downloadCSV("pomidor-schedule.csv", scheduleCsv); exported++; }

    if (exported === 0) {
      toast({ title: "No data to export", description: "Start studying to generate data!" });
    } else {
      toast({ title: "📊 Exported!", description: `Downloaded ${exported} CSV file(s).` });
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
          if (data[key]) {
            localStorage.setItem(key, JSON.stringify(data[key]));
            restored++;
          }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
          <FileSpreadsheet className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import & Export
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-foreground">Export</h3>
            <p className="text-[10px] text-muted-foreground">Download your study data as CSV spreadsheets.</p>
            <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={handleExportCSV}>
              <Download className="mr-1.5 h-3 w-3" />
              Export as CSV
            </Button>
            <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={exportAllJSON}>
              <Download className="mr-1.5 h-3 w-3" />
              Full Backup (JSON)
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-foreground">Import</h3>
            <p className="text-[10px] text-muted-foreground">Restore from a JSON backup file.</p>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1.5 h-3 w-3" />
              Import JSON Backup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
