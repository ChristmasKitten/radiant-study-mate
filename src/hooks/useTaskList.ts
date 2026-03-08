import { useState, useEffect, useCallback } from "react";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subject: string;
  createdAt: number;
}

const TASKS_KEY = "studyflow_tasks";

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {}
}

export function useTaskList() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((text: string, subject: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false, subject, createdAt: Date.now() },
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTasksForSubject = useCallback(
    (subject: string) => tasks.filter((t) => t.subject === subject),
    [tasks]
  );

  const pendingCount = useCallback(
    (subject: string) => tasks.filter((t) => t.subject === subject && !t.completed).length,
    [tasks]
  );

  return { tasks, addTask, toggleTask, removeTask, getTasksForSubject, pendingCount };
}
