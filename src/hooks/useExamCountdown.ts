import { useState, useEffect } from "react";

const STORAGE_KEY = "studyflow_exams";

export interface Exam {
  id: string;
  name: string;
  date: string; // ISO date
  subject?: string;
}

function load(): Exam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function save(exams: Exam[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  } catch {}
}

export function useExamCountdown() {
  const [exams, setExams] = useState<Exam[]>(load);

  useEffect(() => {
    save(exams);
  }, [exams]);

  const addExam = (name: string, date: string, subject?: string) => {
    const exam: Exam = { id: crypto.randomUUID(), name, date, subject };
    setExams((prev) => [...prev, exam].sort((a, b) => a.date.localeCompare(b.date)));
  };

  const removeExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const upcoming = exams.filter((e) => new Date(e.date + "T23:59:59") >= new Date());

  return { exams: upcoming, addExam, removeExam };
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}
