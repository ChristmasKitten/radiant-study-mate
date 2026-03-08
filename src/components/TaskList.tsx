import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from "lucide-react";
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

  const handleAdd = () => {
    if (newTask.trim()) {
      onAdd(newTask.trim(), subject);
      setNewTask("");
    }
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="w-full max-w-md rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <ListTodo className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Tasks — {subject}
        </p>
        {pending.length > 0 && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
            {pending.length}
          </span>
        )}
      </div>

      {/* Add task */}
      <div className="flex gap-2 mb-3">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value.slice(0, 100))}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a task..."
          className="h-8 rounded-lg bg-secondary border-border text-sm flex-1"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newTask.trim()}
          className="h-8 rounded-lg px-3"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Task list */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {pending.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/50 transition-colors"
            >
              <button onClick={() => onToggle(task.id)} className="text-muted-foreground hover:text-primary shrink-0">
                <Circle className="h-4 w-4" />
              </button>
              <span className="text-sm text-foreground flex-1 truncate">{task.text}</span>
              <button
                onClick={() => onRemove(task.id)}
                className="text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive shrink-0 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {completed.length > 0 && (
          <div className="pt-2 border-t border-border/50 mt-2">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1 px-2">Completed</p>
            {completed.map((task) => (
              <motion.div
                key={task.id}
                className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary/50 transition-colors"
              >
                <button onClick={() => onToggle(task.id)} className="text-primary shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground line-through flex-1 truncate">{task.text}</span>
                <button
                  onClick={() => onRemove(task.id)}
                  className="text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive shrink-0 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-4">No tasks yet. Add one above!</p>
      )}
    </div>
  );
}
