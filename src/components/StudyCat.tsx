import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CatState {
  x: number;
  y: number;
  direction: "left" | "right";
  action: "walking" | "sitting" | "sleeping" | "petted";
}

const CAT_FRAMES_RIGHT = ["🐈", "🐈‍⬛"];
const HEART = "💕";

export function StudyCat() {
  const [cat, setCat] = useState<CatState>({
    x: 100,
    y: 0,
    direction: "right",
    action: "walking",
  });
  const [frame, setFrame] = useState(0);
  const [hearts, setHearts] = useState(false);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Walking animation frame
  useEffect(() => {
    if (cat.action !== "walking") return;
    const interval = setInterval(() => setFrame((f) => (f + 1) % 2), 350);
    return () => clearInterval(interval);
  }, [cat.action]);

  // Movement & behavior loop
  useEffect(() => {
    const move = () => {
      setCat((prev) => {
        if (prev.action !== "walking") return prev;

        const maxX = (containerRef.current?.offsetWidth ?? window.innerWidth) - 40;
        const speed = 1.5;
        let newX = prev.x + (prev.direction === "right" ? speed : -speed);
        let newDir = prev.direction;

        if (newX > maxX) { newX = maxX; newDir = "left"; }
        if (newX < 10) { newX = 10; newDir = "right"; }

        return { ...prev, x: newX, direction: newDir };
      });
    };

    const interval = setInterval(move, 30);
    return () => clearInterval(interval);
  }, []);

  // Random sit/sleep
  useEffect(() => {
    const scheduleAction = () => {
      const delay = 8000 + Math.random() * 15000;
      actionTimerRef.current = setTimeout(() => {
        setCat((prev) => {
          if (prev.action === "petted") return prev;
          const action = Math.random() > 0.5 ? "sitting" : "sleeping";
          return { ...prev, action };
        });

        // Resume walking after a rest
        const restTime = 3000 + Math.random() * 5000;
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
  }, []);

  const handlePet = useCallback(() => {
    setCat((prev) => ({ ...prev, action: "petted" }));
    setHearts(true);

    setTimeout(() => {
      setHearts(false);
      setCat((prev) => ({ ...prev, action: "walking" }));
    }, 2000);
  }, []);

  if (!visible) return null;

  const catEmoji =
    cat.action === "sleeping" ? "😺" :
    cat.action === "sitting" ? "🐱" :
    cat.action === "petted" ? "😻" :
    CAT_FRAMES_RIGHT[frame];

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
        style={{ transform: cat.direction === "left" ? "scaleX(-1)" : "scaleX(1)" }}
        title="Pet me! 🐱"
      >
        <div className="relative">
          <span
            className="text-2xl"
            style={{
              display: "inline-block",
              transform: cat.direction === "left" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            {catEmoji}
          </span>

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

      {/* Tiny toggle button */}
      <button
        onClick={() => setVisible(false)}
        className="pointer-events-auto absolute bottom-1 right-2 text-[9px] text-muted-foreground/40 hover:text-muted-foreground"
      >
        hide cat
      </button>
    </div>
  );
}
