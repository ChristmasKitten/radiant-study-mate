import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface ScheduleBlock {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  repeating: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STORAGE_KEY = "studyflow_schedule";

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
            description: `Scheduled: ${block.startTime} – ${block.endTime}`,
            action: onStartSession ? (
              <button
                className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground font-medium"
                onClick={() => onStartSession(block.subject, duration > 0 ? duration : 25)}
              >
                Start Now
              </button>
            ) as any : undefined,
          });

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Time for ${block.subject}!`, {
              body: `Scheduled: ${block.startTime} – ${block.endTime}`,
            });
          }
        }
      }
    };

    const interval = setInterval(check, 30_000); // check every 30s
    check(); // initial check
    return () => clearInterval(interval);
  }, [onStartSession]);
}
