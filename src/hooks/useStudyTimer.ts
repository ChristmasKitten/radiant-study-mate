import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  totalFocusTime: number;
}

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function useStudyTimer() {
  const [state, setState] = useState<TimerState>({
    mode: "focus",
    timeLeft: DURATIONS.focus,
    isRunning: false,
    sessionsCompleted: 0,
    totalFocusTime: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

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
            // Timer finished
            const wasFocus = prev.mode === "focus";
            const newSessions = wasFocus ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
            const newTotal = wasFocus ? prev.totalFocusTime + DURATIONS.focus : prev.totalFocusTime;
            const nextMode: TimerMode = wasFocus
              ? newSessions % 4 === 0 ? "longBreak" : "shortBreak"
              : "focus";

            // Play notification sound
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

            return {
              ...prev,
              mode: nextMode,
              timeLeft: DURATIONS[nextMode],
              isRunning: false,
              sessionsCompleted: newSessions,
              totalFocusTime: newTotal,
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
    startTimeRef.current = Date.now();
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, timeLeft: DURATIONS[prev.mode], isRunning: false }));
  }, []);

  const setMode = useCallback((mode: TimerMode) => {
    setState((prev) => ({ ...prev, mode, timeLeft: DURATIONS[mode], isRunning: false }));
  }, []);

  const progress = 1 - state.timeLeft / DURATIONS[state.mode];

  return { ...state, progress, start, pause, reset, setMode, durations: DURATIONS };
}
