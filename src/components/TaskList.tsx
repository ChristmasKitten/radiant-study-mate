import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Task } from "@/hooks/useTaskList";

interface TaskListProps {
  subject: string;
  tasks: Task[];
  onAdd: (text: string, subject: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskList({ subject, tasks, onAdd, onToggle, onRemove }: TaskListProps) {
  const [newTask, setNewTask] = useState("");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("studyflow_tasks_hidden") === "true");

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem("studyflow_tasks_hidden", String(!v));
      return !v;
    });
  };

  const handleAdd = () => {
    if (newTask.trim()) {
      onAdd(newTask.trim(), subject);
      setNewTask("");
    }
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="w-full max-w-md rounded-xl bg-card border border-border p-3">
      <div className="flex items-center justify-between">
        <button onClick={toggleCollapsed} className="flex items-center gap-2 group">
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          )}
          <ListTodo className="h-3.5 w-3.5 text-primary" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Tasks — {subject}
          </p>
        </button>
        <div className="flex items-center gap-1.5">
          {pending.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary">
              {pending.length}
            </span>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="mt-3">
          {/* Add task */}
          <div className="flex gap-1.5 mb-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value.slice(0, 100))}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a task..."
              className="h-7 rounded-lg bg-secondary border-border text-xs flex-1"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newTask.trim()}
              className="h-7 rounded-lg px-2.5"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Task list */}
          <div className="space-y-0.5 max-h-44 overflow-y-auto">
            <AnimatePresence>
              {pending.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary/50"
                >
                  <button onClick={() => onToggle(task.id)} className="text-muted-foreground hover:text-primary shrink-0">
                    <Circle className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs text-foreground flex-1 truncate">{task.text}</span>
                  <button
                    onClick={() => onRemove(task.id)}
                    className="text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive shrink-0"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {completed.length > 0 && (
              <div className="pt-1.5 border-t border-border/50 mt-1.5">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5 px-2">Completed</p>
                {completed.map((task) => (
                  <motion.div
                    key={task.id}
                    className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary/50"
                  >
                    <button onClick={() => onToggle(task.id)} className="text-primary shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs text-muted-foreground line-through flex-1 truncate">{task.text}</span>
                    <button
                      onClick={() => onRemove(task.id)}
                      className="text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive shrink-0"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {tasks.length === 0 && (
            <p className="text-center text-[10px] text-muted-foreground/50 py-3">No tasks yet</p>
          )}
        </div>
      )}
    </div>
  );
}
