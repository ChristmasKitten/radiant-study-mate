import { useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface UseRemindersOptions {
  isRunning: boolean;
  eyeRestIntervalMin?: number;
  hydrationIntervalMin?: number;
}

export function useReminders({
  isRunning,
  eyeRestIntervalMin = 20,
  hydrationIntervalMin = 30,
}: UseRemindersOptions) {
  const eyeRef = useRef<number | null>(null);
  const waterRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (eyeRef.current) { window.clearInterval(eyeRef.current); eyeRef.current = null; }
    if (waterRef.current) { window.clearInterval(waterRef.current); waterRef.current = null; }
  }, []);

  useEffect(() => {
    clear();
    if (!isRunning) return;

    eyeRef.current = window.setInterval(() => {
      toast({
        title: "👁️ Eye Rest (20-20-20)",
        description: "Look at something 20 feet away for 20 seconds.",
      });
    }, eyeRestIntervalMin * 60 * 1000);

    waterRef.current = window.setInterval(() => {
      toast({
        title: "💧 Stay Hydrated",
        description: "Take a sip of water to keep focused!",
      });
    }, hydrationIntervalMin * 60 * 1000);

    return clear;
  }, [isRunning, eyeRestIntervalMin, hydrationIntervalMin, clear]);
}
