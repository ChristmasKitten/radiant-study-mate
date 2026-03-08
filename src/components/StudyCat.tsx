import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CatMood = "happy" | "focused" | "sleepy" | "idle";
type CatAction = "walking" | "sitting" | "sleeping" | "petted";

interface StudyCatProps {
  visible: boolean;
  onHide: () => void;
  isRunning?: boolean;
  mode?: "focus" | "shortBreak" | "longBreak";
  totalFocusTime?: number; // seconds studied today
}

interface CatState {
  x: number;
  direction: "left" | "right";
  action: CatAction;
}

const HEART = "💕";

function getMood(isRunning: boolean, mode: string, totalFocusTime: number): CatMood {
  if (!isRunning && mode !== "focus") return "sleepy";
  if (isRunning && mode === "focus") {
    return totalFocusTime > 1800 ? "happy" : "focused";
  }
  if (mode === "shortBreak" || mode === "longBreak") return "sleepy";
  return "idle";
}

function getMoodEmoji(mood: CatMood, action: CatAction, frame: number): string {
  if (action === "petted") return "😻";
  if (action === "sleeping") return "😴";

  switch (mood) {
    case "happy": return action === "sitting" ? "😸" : ["🐈", "🐈‍⬛"][frame];
    case "focused": return action === "sitting" ? "🐱" : ["🐈", "🐈‍⬛"][frame];
    case "sleepy": return action === "sitting" ? "😺" : "🐈";
    case "idle": return action === "sitting" ? "🐱" : ["🐈", "🐈‍⬛"][frame];
  }
}

function getMoodBubble(mood: CatMood, action: CatAction): string | null {
  if (action === "petted" || action === "sleeping") return null;
  switch (mood) {
    case "happy": return "⭐";
    case "focused": return "📖";
    case "sleepy": return "💤";
    default: return null;
  }
}

export function StudyCat({ visible, onHide, isRunning = false, mode = "focus", totalFocusTime = 0 }: StudyCatProps) {
  const [cat, setCat] = useState<CatState>({
    x: 100,
    direction: "right",
    action: "walking",
  });
  const [frame, setFrame] = useState(0);
  const [hearts, setHearts] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const mood = getMood(isRunning, mode, totalFocusTime);

  // Speed varies by mood
  const speed = mood === "sleepy" ? 0.8 : mood === "happy" ? 2.2 : 1.5;

  // Walking animation frame
  useEffect(() => {
    if (cat.action !== "walking") return;
    const interval = setInterval(() => setFrame((f) => (f + 1) % 2), mood === "sleepy" ? 500 : 300);
    return () => clearInterval(interval);
  }, [cat.action, mood]);

  // Movement loop
  useEffect(() => {
    if (!visible) return;
    const move = () => {
      setCat((prev) => {
        if (prev.action !== "walking") return prev;
        const maxX = (containerRef.current?.offsetWidth ?? window.innerWidth) - 40;
        let newX = prev.x + (prev.direction === "right" ? speed : -speed);
        let newDir = prev.direction;
        if (newX > maxX) { newX = maxX; newDir = "left"; }
        if (newX < 10) { newX = 10; newDir = "right"; }
        return { ...prev, x: newX, direction: newDir };
      });
    };
    const interval = setInterval(move, 30);
    return () => clearInterval(interval);
  }, [visible, speed]);

  // Random sit/sleep - sleepy mood rests more often
  useEffect(() => {
    if (!visible) return;
    const scheduleAction = () => {
      const delay = mood === "sleepy"
        ? 4000 + Math.random() * 6000
        : 8000 + Math.random() * 15000;

      actionTimerRef.current = setTimeout(() => {
        setCat((prev) => {
          if (prev.action === "petted") return prev;
          const action: CatAction = mood === "sleepy"
            ? (Math.random() > 0.3 ? "sleeping" : "sitting")
            : (Math.random() > 0.5 ? "sitting" : "sleeping");
          return { ...prev, action };
        });

        const restTime = mood === "sleepy"
          ? 5000 + Math.random() * 8000
          : 3000 + Math.random() * 5000;

        setTimeout(() => {
          setCat((prev) => {
            if (prev.action === "petted") return prev;
            return { ...prev, action: "walking" };
          });
          scheduleAction();
        }, restTime);
      }, delay);
    };

    scheduleAction();
    return () => {
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    };
  }, [visible, mood]);

  const handlePet = useCallback(() => {
    setCat((prev) => ({ ...prev, action: "petted" }));
    setHearts(true);
    setTimeout(() => {
      setHearts(false);
      setCat((prev) => ({ ...prev, action: "walking" }));
    }, 2000);
  }, []);

  if (!visible) return null;

  const catEmoji = getMoodEmoji(mood, cat.action, frame);
  const bubble = getMoodBubble(mood, cat.action);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 h-12 pointer-events-none z-50"
    >
      <motion.div
        className="absolute bottom-1 pointer-events-auto cursor-pointer select-none"
        animate={{ x: cat.x }}
        transition={{ type: "tween", duration: 0.03 }}
        onClick={handlePet}
        title="Pet me! 🐱"
      >
        <div className="relative">
          <span
            className="text-2xl inline-block"
            style={{ transform: cat.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}
          >
            {catEmoji}
          </span>

          {/* Mood bubble */}
          {bubble && cat.action !== "sleeping" && (
            <span className="absolute -top-4 -right-2 text-[10px] animate-pulse">
              {bubble}
            </span>
          )}

          {/* Zzz for sleeping */}
          {cat.action === "sleeping" && (
            <span className="absolute -top-4 -right-2 text-[10px] text-muted-foreground animate-pulse">
              💤
            </span>
          )}

          {/* Hearts when petted */}
          <AnimatePresence>
            {hearts && (
              <motion.span
                className="absolute -top-6 left-1/2 text-sm"
                initial={{ opacity: 0, y: 0, x: "-50%" }}
                animate={{ opacity: 1, y: -12, x: "-50%" }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                {HEART}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <button
        onClick={onHide}
        className="pointer-events-auto absolute bottom-1 right-2 text-[9px] text-muted-foreground/40 hover:text-muted-foreground"
      >
        hide cat
      </button>
    </div>
  );
}
