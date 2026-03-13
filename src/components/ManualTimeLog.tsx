import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface ManualTimeLogProps {
  subjects: string[];
  onLog: (subject: string, minutes: number, date?: string) => void;
}

export function ManualTimeLog({ subjects, onLog }: ManualTimeLogProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(subjects[0] ?? "");
  const [minutes, setMinutes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    const mins = parseFloat(minutes);
    if (!subject.trim() || isNaN(mins) || mins <= 0) {
      toast({ title: "Invalid input", description: "Enter a subject and valid duration." });
      return;
    }
    onLog(subject.trim(), mins, date);
    toast({ title: "✅ Time logged!", description: `${mins} min of ${subject} on ${date}` });
    setMinutes("");
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 rounded-full px-3 text-xs"
      >
        <Plus className="h-3 w-3 mr-1" /> Log Time
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Log Past Study Time</span>
      </div>

      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none"
      >
        {subjects.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <Input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes"
          min={1}
          className="h-8 text-xs rounded-lg flex-1"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-8 text-xs rounded-lg flex-1"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} className="flex-1 h-8 rounded-lg text-xs">
          Log Time
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} className="h-8 rounded-lg text-xs">
          Cancel
        </Button>
      </div>
    </div>
  );
}
