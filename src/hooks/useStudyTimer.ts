import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

export interface SubjectTime {
  subject: string;
  totalSeconds: number;
  sessions: number;
}

interface PersistedData {
  sessionsCompleted: number;
  totalFocusTime: number;
  subjects: string[];
  subjectTimes: SubjectTime[];
  allTimeTotalSeconds: number;
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
}

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const STORAGE_KEY = "studyflow_data";

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

  const [state, setState] = useState<TimerState>({
    mode: "focus",
    timeLeft: DURATIONS.focus,
    isRunning: false,
    sessionsCompleted: persisted.sessionsCompleted ?? 0,
    totalFocusTime: persisted.totalFocusTime ?? 0,
    currentSubject: persisted.subjects?.[0] ?? DEFAULT_SUBJECTS[0],
    subjects: persisted.subjects?.length ? persisted.subjects : DEFAULT_SUBJECTS,
    subjectTimes: persisted.subjectTimes ?? [],
    allTimeTotalSeconds: persisted.allTimeTotalSeconds ?? 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedThisSession = useRef<number>(0);

  // Persist on changes
  useEffect(() => {
    savePersistedData({
      sessionsCompleted: state.sessionsCompleted,
      totalFocusTime: state.totalFocusTime,
      subjects: state.subjects,
      subjectTimes: state.subjectTimes,
      allTimeTotalSeconds: state.allTimeTotalSeconds,
    });
  }, [state.sessionsCompleted, state.totalFocusTime, state.subjects, state.subjectTimes, state.allTimeTotalSeconds]);

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
          // Track elapsed time for focus sessions
          if (prev.mode === "focus") {
            elapsedThisSession.current += 1;
          }

          if (prev.timeLeft <= 1) {
            const wasFocus = prev.mode === "focus";
            const newSessions = wasFocus ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
            const sessionDuration = wasFocus ? DURATIONS.focus : 0;
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

            elapsedThisSession.current = 0;

            return {
              ...prev,
              mode: nextMode,
              timeLeft: DURATIONS[nextMode],
              isRunning: false,
              sessionsCompleted: newSessions,
              totalFocusTime: newTotal,
              allTimeTotalSeconds: newAllTime,
              subjectTimes: newSubjectTimes,
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
    elapsedThisSession.current = 0;
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    elapsedThisSession.current = 0;
    setState((prev) => ({ ...prev, timeLeft: DURATIONS[prev.mode], isRunning: false }));
  }, []);

  const setMode = useCallback((mode: TimerMode) => {
    elapsedThisSession.current = 0;
    setState((prev) => ({ ...prev, mode, timeLeft: DURATIONS[mode], isRunning: false }));
  }, []);

  const setCurrentSubject = useCallback((subject: string) => {
    setState((prev) => ({ ...prev, currentSubject: subject }));
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

  const progress = 1 - state.timeLeft / DURATIONS[state.mode];

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
    durations: DURATIONS,
  };
}
