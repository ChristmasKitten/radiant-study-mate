import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamificationContext } from "@/contexts/GamificationContext";
import { SHOP_ITEMS } from "@/components/CosmeticsShop";

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
  targetX: number;
  direction: "left" | "right";
  action: CatAction;
}

const HEART = "💕";

function getMood(isRunning: boolean, mode: string, totalFocusTime: number): CatMood {
  if (!isRunning && mode !== "focus") return "sleepy";
  if (isRunning && mode === "focus") return totalFocusTime > 1800 ? "happy" : "focused";
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
  if (action === "petted" || action === "sleeping" || action === "walking") return null;
  switch (mood) {
    case "happy": return "⭐";
    case "focused": return "📖";
    case "sleepy": return "💤";
    default: return null;
  }
}

function randomTarget(maxX: number): number {
  return 20 + Math.random() * Math.max(maxX - 40, 100);
}

export const StudyCat = memo(function StudyCat({ visible, onHide, isRunning = false, mode = "focus", totalFocusTime = 0 }: StudyCatProps) {
  const { equippedItems } = useGamification();
  const equippedHatId = equippedItems["cat_hat"];
  const equippedAccessoryId = equippedItems["cat_accessory"];
  const equippedSkinId = equippedItems["cat_skin"];
  const equippedHat = SHOP_ITEMS.find((i) => i.id === equippedHatId)?.emoji;
  const equippedAccessory = SHOP_ITEMS.find((i) => i.id === equippedAccessoryId)?.emoji;
  const equippedSkin = SHOP_ITEMS.find((i) => i.id === equippedSkinId)?.emoji;

  const containerRef = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState<CatState>(() => ({
    x: 100,
    targetX: 300,
    direction: "right",
    action: "walking",
  }));
  const [hearts, setHearts] = useState(false);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const mood = getMood(isRunning, mode, totalFocusTime);
  const speed = mood === "sleepy" ? 0.6 : mood === "happy" ? 1.8 : 1.2;

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
          const dist = prev.targetX - prev.x;
          if (Math.abs(dist) < 2) {
            const newTarget = randomTarget(maxX);
            return { ...prev, targetX: newTarget, direction: newTarget > prev.x ? "right" : "left" };
          }
          const dir = dist > 0 ? 1 : -1;
          return { ...prev, x: prev.x + dir * speed, direction: dir > 0 ? "right" : "left" };
        });
      }
      animId = requestAnimationFrame(move);
    };

    animId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animId);
  }, [visible, speed]);

  useEffect(() => {
    if (!visible) return;
    const scheduleAction = () => {
      const delay = mood === "sleepy" ? 4000 + Math.random() * 6000 : 6000 + Math.random() * 12000;
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
          const maxX = (containerRef.current?.offsetWidth ?? window.innerWidth) - 40;
          setCat((prev) => {
            if (prev.action === "petted") return prev;
            const newTarget = randomTarget(maxX);
            return { ...prev, action: "walking", targetX: newTarget, direction: newTarget > prev.x ? "right" : "left" };
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
      const maxX = (containerRef.current?.offsetWidth ?? window.innerWidth) - 40;
      const newTarget = randomTarget(maxX);
      setCat((prev) => ({ ...prev, action: "walking", targetX: newTarget, direction: newTarget > prev.x ? "right" : "left" }));
    }, 2000);
  }, []);

  if (!visible) return null;

  const catEmoji = equippedSkin || getMoodEmoji(mood, cat.action);
  const bubble = getMoodBubble(mood, cat.action);

  return (
    <div ref={containerRef} className="fixed bottom-0 left-0 right-0 h-14 pointer-events-none z-50">
      <div
        className="absolute bottom-1 pointer-events-auto cursor-pointer select-none"
        style={{ transform: `translateX(${cat.x}px)`, transition: "transform 0.05s linear" }}
        onClick={handlePet}
        title="Pet me! 🐱"
      >
        <div className="relative">
          <span className="text-2xl inline-block" style={{ transform: cat.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
            {catEmoji}
            {equippedHat && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-base drop-shadow-sm z-10">{equippedHat}</span>
            )}
            {equippedAccessory && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs drop-shadow-sm z-10">{equippedAccessory}</span>
            )}
          </span>

          {bubble && <span className="absolute -top-4 -right-2 text-[10px] animate-pulse">{bubble}</span>}
          {cat.action === "sleeping" && <span className="absolute -top-4 -right-2 text-[10px] text-muted-foreground animate-pulse">💤</span>}

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
