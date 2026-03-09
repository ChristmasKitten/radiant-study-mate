import { useState } from "react";
import { Plus, X, Clock, Calendar, Repeat, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface ScheduleBlock {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  repeating: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STORAGE_KEY = "studyflow_schedule";

function loadSchedule(): ScheduleBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSchedule(blocks: ScheduleBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

interface StudyScheduleProps {
  onStartSession?: (subject: string, durationMinutes: number) => void;
}

export function StudySchedule({ onStartSession }: StudyScheduleProps) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(loadSchedule);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    days: ["Mon"] as string[],
    startTime: "09:00",
    endTime: "10:00",
    repeating: true,
  });

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  };

  const handleAdd = () => {
    if (!form.subject.trim() || form.days.length === 0) return;
    const newBlocks: ScheduleBlock[] = form.days.map((day) => ({
      id: `${Date.now()}-${day}`,
      subject: form.subject.trim(),
      day,
      startTime: form.startTime,
      endTime: form.endTime,
      repeating: form.repeating,
    }));
    const updated = [...blocks, ...newBlocks];
    setBlocks(updated);
    saveSchedule(updated);
    setAdding(false);
    setForm({ subject: "", days: ["Mon"], startTime: "09:00", endTime: "10:00", repeating: true });
  };

  const handleRemove = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    saveSchedule(updated);
  };

  const getDurationMinutes = (start: string, end: string): number => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium text-foreground">Study Schedule</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdding(!adding)}
          className="h-7 rounded-full px-3 text-xs"
        >
          {adding ? "Cancel" : <><Plus className="h-3 w-3 mr-1" /> Add</>}
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Input
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="Subject name"
            className="h-8 text-sm rounded-lg"
          />

          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">Days</p>
            <div className="flex gap-1">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
                    form.days.includes(d)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="flex-1 h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none"
            />
            <span className="flex items-center text-xs text-muted-foreground">→</span>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="flex-1 h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Repeat className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Repeat weekly</span>
            </div>
            <Switch checked={form.repeating} onCheckedChange={(v) => setForm((f) => ({ ...f, repeating: v }))} />
          </div>

          <Button size="sm" onClick={handleAdd} className="w-full h-8 rounded-lg text-xs" disabled={!form.subject.trim() || form.days.length === 0}>
            Add to Schedule
          </Button>
        </div>
      )}

      {/* Weekly view */}
      <div className="space-y-2">
        {DAYS.map((day) => {
          const dayBlocks = blocks
            .filter((b) => b.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          if (dayBlocks.length === 0 && day !== today) return null;

          const isToday = day === today;

          return (
            <div
              key={day}
              className={`rounded-xl border p-3 ${
                isToday ? "border-primary/30 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                  {day}
                </span>
                {isToday && <span className="text-[9px] rounded-full bg-primary/20 text-primary px-1.5 py-0.5">Today</span>}
              </div>

              {dayBlocks.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">No sessions planned</p>
              ) : (
                <div className="space-y-1.5">
                  {dayBlocks.map((block) => {
                    const duration = getDurationMinutes(block.startTime, block.endTime);
                    return (
                      <div key={block.id} className="group flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {block.startTime}–{block.endTime}
                        </span>
                        <span className="text-xs font-medium text-foreground">{block.subject}</span>
                        {block.repeating && <Repeat className="h-2.5 w-2.5 text-muted-foreground/50" />}
                        {isToday && onStartSession && (
                          <button
                            onClick={() => onStartSession(block.subject, duration > 0 ? duration : 25)}
                            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title="Start this session"
                          >
                            <Play className="h-2.5 w-2.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(block.id)}
                          className={`${isToday && onStartSession ? "" : "ml-auto "}hidden h-4 w-4 items-center justify-center rounded-full text-destructive group-hover:flex`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {blocks.length === 0 && !adding && (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No sessions scheduled yet</p>
          <p className="text-[10px] text-muted-foreground/60">Click + Add to create your study plan</p>
        </div>
      )}
    </div>
  );
}
