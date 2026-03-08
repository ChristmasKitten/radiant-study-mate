import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CatMood = "happy" | "focused" | "sleepy" | "idle";
type CatAction = "walking" | "sitting" | "sleeping" | "petted";

interface StudyCatProps {
  visible: boolean;
  onHide: () => void;
  isRunning?: boolean;
  mode?: "focus" | "shortBreak" | "longBreak";
  totalFocusTime?: number;
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

function getMoodEmoji(mood: CatMood, action: CatAction): string {
  if (action === "petted") return "😻";
  if (action === "sleeping") return "😴";
  switch (mood) {
    case "happy": return action === "sitting" ? "😸" : "🐱";
    case "focused": return action === "sitting" ? "🐱" : "🐱";
    case "sleepy": return action === "sitting" ? "😺" : "😺";
    case "idle": return action === "sitting" ? "🐱" : "🐱";
  }
}

function getMoodBubble(mood: CatMood, action: CatAction): string | null {
  if (action === "petted" || action === "sleeping") return null;
  if (action === "walking") return null;
  switch (mood) {
    case "happy": return "⭐";
    case "focused": return "📖";
    case "sleepy": return "💤";
    default: return null;
  }
}

export const StudyCat = memo(function StudyCat({ visible, onHide, isRunning = false, mode = "focus", totalFocusTime = 0 }: StudyCatProps) {
  const [cat, setCat] = useState<CatState>({
    x: 100,
    direction: "right",
    action: "walking",
  });
  const [hearts, setHearts] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const catRef = useRef(cat);
  catRef.current = cat;

  const mood = getMood(isRunning, mode, totalFocusTime);
  const speed = mood === "sleepy" ? 0.8 : mood === "happy" ? 2.0 : 1.4;

  // Movement loop using requestAnimationFrame for smooth motion
  useEffect(() => {
    if (!visible) return;
    let animId: number;
    let lastTime = 0;

    const move = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const delta = time - lastTime;

      if (delta > 30) {
        lastTime = time;
        setCat((prev) => {
          if (prev.action !== "walking") return prev;
          const maxX = (containerRef.current?.offsetWidth ?? window.innerWidth) - 40;
          let newX = prev.x + (prev.direction === "right" ? speed : -speed);
          let newDir = prev.direction;
          if (newX > maxX) { newX = maxX; newDir = "left"; }
          if (newX < 10) { newX = 10; newDir = "right"; }
          if (newX === prev.x && newDir === prev.direction) return prev;
          return { ...prev, x: newX, direction: newDir };
        });
      }
      animId = requestAnimationFrame(move);
    };

    animId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animId);
  }, [visible, speed]);

  // Random sit/sleep
  useEffect(() => {
    if (!visible) return;
    const scheduleAction = () => {
      const delay = mood === "sleepy" ? 4000 + Math.random() * 6000 : 8000 + Math.random() * 15000;
      actionTimerRef.current = setTimeout(() => {
        setCat((prev) => {
          if (prev.action === "petted") return prev;
          const action: CatAction = mood === "sleepy"
            ? (Math.random() > 0.3 ? "sleeping" : "sitting")
            : (Math.random() > 0.5 ? "sitting" : "sleeping");
          return { ...prev, action };
        });

        const restTime = mood === "sleepy" ? 5000 + Math.random() * 8000 : 3000 + Math.random() * 5000;
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
    return () => { if (actionTimerRef.current) clearTimeout(actionTimerRef.current); };
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

  const catEmoji = getMoodEmoji(mood, cat.action);
  const bubble = getMoodBubble(mood, cat.action);

  return (
    <div ref={containerRef} className="fixed bottom-0 left-0 right-0 h-12 pointer-events-none z-50">
      <div
        className="absolute bottom-1 pointer-events-auto cursor-pointer select-none"
        style={{
          transform: `translateX(${cat.x}px)`,
          transition: "transform 0.05s linear",
        }}
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

          {bubble && (
            <span className="absolute -top-4 -right-2 text-[10px] animate-pulse">{bubble}</span>
          )}

          {cat.action === "sleeping" && (
            <span className="absolute -top-4 -right-2 text-[10px] text-muted-foreground animate-pulse">💤</span>
          )}

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
      </div>
    </div>
  );
});
