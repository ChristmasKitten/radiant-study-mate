import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

export interface SubjectTime {
  subject: string;
  totalSeconds: number;
  sessions: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  sessions: number;
}

export interface CustomDurations {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

interface PersistedData {
  sessionsCompleted: number;
  totalFocusTime: number;
  subjects: string[];
  subjectTimes: SubjectTime[];
  allTimeTotalSeconds: number;
  dailyRecords: DailyRecord[];
  customDurations: CustomDurations;
  todayDate: string;
}

interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  totalFocusTime: number;
  currentSubject: string;
  subjects: string[];
  subjectTimes: SubjectTime[];
  allTimeTotalSeconds: number;
  dailyRecords: DailyRecord[];
  customDurations: CustomDurations;
  todayDate: string;
}

const DEFAULT_DURATIONS: CustomDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const STORAGE_KEY = "studyflow_data";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function loadPersistedData(): Partial<PersistedData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function savePersistedData(data: PersistedData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const DEFAULT_SUBJECTS = ["Math", "Science", "English", "History"];

export function useStudyTimer() {
  const persisted = loadPersistedData();
  const today = getToday();

  // Reset today's stats if date changed
  const isNewDay = persisted.todayDate !== today;

  const durations = persisted.customDurations ?? DEFAULT_DURATIONS;

  const [state, setState] = useState<TimerState>({
    mode: "focus",
    timeLeft: durations.focus * 60,
    isRunning: false,
    sessionsCompleted: isNewDay ? 0 : (persisted.sessionsCompleted ?? 0),
    totalFocusTime: isNewDay ? 0 : (persisted.totalFocusTime ?? 0),
    currentSubject: persisted.subjects?.[0] ?? DEFAULT_SUBJECTS[0],
    subjects: persisted.subjects?.length ? persisted.subjects : DEFAULT_SUBJECTS,
    subjectTimes: persisted.subjectTimes ?? [],
    allTimeTotalSeconds: persisted.allTimeTotalSeconds ?? 0,
    dailyRecords: persisted.dailyRecords ?? [],
    customDurations: durations,
    todayDate: today,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist on changes
  useEffect(() => {
    savePersistedData({
      sessionsCompleted: state.sessionsCompleted,
      totalFocusTime: state.totalFocusTime,
      subjects: state.subjects,
      subjectTimes: state.subjectTimes,
      allTimeTotalSeconds: state.allTimeTotalSeconds,
      dailyRecords: state.dailyRecords,
      customDurations: state.customDurations,
      todayDate: state.todayDate,
    });
  }, [state.sessionsCompleted, state.totalFocusTime, state.subjects, state.subjectTimes, state.allTimeTotalSeconds, state.dailyRecords, state.customDurations, state.todayDate]);

  const getDurationSeconds = useCallback((mode: TimerMode, dur: CustomDurations) => {
    return dur[mode] * 60;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            const wasFocus = prev.mode === "focus";
            const newSessions = wasFocus ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
            const sessionDuration = wasFocus ? prev.customDurations.focus * 60 : 0;
            const newTotal = prev.totalFocusTime + sessionDuration;
            const newAllTime = prev.allTimeTotalSeconds + sessionDuration;
            const nextMode: TimerMode = wasFocus
              ? newSessions % 4 === 0 ? "longBreak" : "shortBreak"
              : "focus";

            // Update subject time
            let newSubjectTimes = [...prev.subjectTimes];
            if (wasFocus) {
              const idx = newSubjectTimes.findIndex((s) => s.subject === prev.currentSubject);
              if (idx >= 0) {
                newSubjectTimes[idx] = {
                  ...newSubjectTimes[idx],
                  totalSeconds: newSubjectTimes[idx].totalSeconds + sessionDuration,
                  sessions: newSubjectTimes[idx].sessions + 1,
                };
              } else {
                newSubjectTimes.push({ subject: prev.currentSubject, totalSeconds: sessionDuration, sessions: 1 });
              }
            }

            // Update daily record
            let newDailyRecords = [...prev.dailyRecords];
            if (wasFocus) {
              const todayStr = getToday();
              const dayIdx = newDailyRecords.findIndex((d) => d.date === todayStr);
              if (dayIdx >= 0) {
                newDailyRecords[dayIdx] = {
                  ...newDailyRecords[dayIdx],
                  totalSeconds: newDailyRecords[dayIdx].totalSeconds + sessionDuration,
                  sessions: newDailyRecords[dayIdx].sessions + 1,
                };
              } else {
                newDailyRecords.push({ date: todayStr, totalSeconds: sessionDuration, sessions: 1 });
              }
            }

            // Play sound
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 800;
              gain.gain.value = 0.3;
              osc.start();
              osc.stop(ctx.currentTime + 0.3);
            } catch {}

            // Notify listeners (for celebrations)
            if (wasFocus) {
              window.dispatchEvent(new CustomEvent("studyflow:session-complete"));
            }

            return {
              ...prev,
              mode: nextMode,
              timeLeft: prev.customDurations[nextMode] * 60,
              isRunning: false,
              sessionsCompleted: newSessions,
              totalFocusTime: newTotal,
              allTimeTotalSeconds: newAllTime,
              subjectTimes: newSubjectTimes,
              dailyRecords: newDailyRecords,
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [state.isRunning, clearTimer]);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, timeLeft: prev.customDurations[prev.mode] * 60, isRunning: false }));
  }, []);

  const setMode = useCallback((mode: TimerMode) => {
    setState((prev) => ({ ...prev, mode, timeLeft: prev.customDurations[mode] * 60, isRunning: false }));
  }, []);

  const setCurrentSubject = useCallback((subject: string) => {
    setState((prev) => (prev.isRunning ? prev : { ...prev, currentSubject: subject }));
  }, []);

  const addSubject = useCallback((subject: string) => {
    const trimmed = subject.trim();
    if (!trimmed) return;
    setState((prev) => {
      if (prev.subjects.includes(trimmed)) return prev;
      return { ...prev, subjects: [...prev.subjects, trimmed], currentSubject: trimmed };
    });
  }, []);

  const removeSubject = useCallback((subject: string) => {
    setState((prev) => {
      const filtered = prev.subjects.filter((s) => s !== subject);
      if (filtered.length === 0) return prev;
      return {
        ...prev,
        subjects: filtered,
        currentSubject: prev.currentSubject === subject ? filtered[0] : prev.currentSubject,
      };
    });
  }, []);

  const setCustomDurations = useCallback((newDurations: CustomDurations) => {
    setState((prev) => ({
      ...prev,
      customDurations: newDurations,
      timeLeft: prev.isRunning ? prev.timeLeft : newDurations[prev.mode] * 60,
    }));
  }, []);

  const progress = 1 - state.timeLeft / (state.customDurations[state.mode] * 60);

  // Computed analytics
  const bestDayRecord = state.dailyRecords.reduce<DailyRecord | null>(
    (best, day) => (!best || day.totalSeconds > best.totalSeconds ? day : best),
    null
  );

  const last7Days = (() => {
    const days: DailyRecord[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const existing = state.dailyRecords.find((r) => r.date === dateStr);
      days.push(existing ?? { date: dateStr, totalSeconds: 0, sessions: 0 });
    }
    return days;
  })();

  const avgDailyTime = state.dailyRecords.length > 0
    ? state.dailyRecords.reduce((sum, d) => sum + d.totalSeconds, 0) / state.dailyRecords.length
    : 0;

  return {
    ...state,
    progress,
    start,
    pause,
    reset,
    setMode,
    setCurrentSubject,
    addSubject,
    removeSubject,
    setCustomDurations,
    bestDayRecord,
    last7Days,
    avgDailyTime,
  };
}
