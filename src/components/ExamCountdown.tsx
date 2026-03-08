import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Plus, X, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Exam, daysUntil } from "@/hooks/useExamCountdown";

interface ExamCountdownProps {
  exams: Exam[];
  onAdd: (name: string, date: string) => void;
  onRemove: (id: string) => void;
}

export function ExamCountdown({ exams, onAdd, onRemove }: ExamCountdownProps) {
  const [adding, setAdding] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("studyflow_exam_hidden") === "true");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem("studyflow_exam_hidden", String(!v));
      return !v;
    });
  };

  const handleAdd = () => {
    if (name.trim() && date) {
      onAdd(name.trim(), date);
      setName("");
      setDate("");
      setAdding(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <button onClick={toggleCollapsed} className="flex items-center gap-2 group">
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          )}
          <CalendarClock className="h-4 w-4 text-primary" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Exam Countdown {exams.length > 0 && `(${exams.length})`}
          </p>
        </button>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
            onClick={() => setAdding(!adding)}
          >
            {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="mt-3">
          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Exam name"
                    className="flex-1 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-36 text-sm"
                  />
                  <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !date}>
                    Add
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {exams.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-2">No upcoming exams — add one above</p>
          ) : (
            <div className="space-y-2">
              {exams.map((exam) => {
                const days = daysUntil(exam.date);
                const urgency = days <= 3 ? "text-destructive" : days <= 7 ? "text-timer-warn" : "text-primary";
                return (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{exam.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(exam.date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`font-mono text-lg font-bold ${urgency}`}>
                        {days === 0 ? "Today!" : days === 1 ? "1 day" : `${days}d`}
                      </div>
                      <button
                        onClick={() => onRemove(exam.id)}
                        className="hidden rounded p-1 text-muted-foreground hover:text-destructive group-hover:block"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
