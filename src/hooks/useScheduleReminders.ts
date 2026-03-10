import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STORAGE_KEY = "studyflow_schedule";

interface ScheduleBlock {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  repeating: boolean;
}

function loadSchedule(): ScheduleBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

interface UseScheduleRemindersProps {
  onStartSession?: (subject: string, durationMinutes: number) => void;
}

export function useScheduleReminders({ onStartSession }: UseScheduleRemindersProps) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const today = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const blocks = loadSchedule();
      const todayBlocks = blocks.filter(b => b.day === today);

      for (const block of todayBlocks) {
        const key = `${block.id}-${now.toDateString()}`;
        if (notifiedRef.current.has(key)) continue;

        if (block.startTime === currentTime) {
          notifiedRef.current.add(key);
          const [sh, sm] = block.startTime.split(":").map(Number);
          const [eh, em] = block.endTime.split(":").map(Number);
          const duration = (eh * 60 + em) - (sh * 60 + sm);

          toast({
            title: `📚 Time for ${block.subject}!`,
            description: `Scheduled: ${block.startTime} – ${block.endTime}. Click to start!`,
          });

          if (onStartSession) {
            onStartSession(block.subject, duration > 0 ? duration : 25);
          }

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Time for ${block.subject}!`, {
              body: `Scheduled: ${block.startTime} – ${block.endTime}`,
            });
          }
        }
      }
    };

    const interval = setInterval(check, 30_000);
    check();
    return () => clearInterval(interval);
  }, [onStartSession]);
}
