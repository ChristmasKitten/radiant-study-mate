import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Obstacle {
  id: number;
  x: number;
  type: "rock" | "tree" | "ramp";
  height: number;
  width: number;
}

interface GameState {
  catY: number;
  catVelocity: number;
  isJumping: boolean;
  score: number;
  obstacles: Obstacle[];
  speed: number;
  gameOver: boolean;
  trickText: string | null;
  trickTimer: number;
  combo: number;
  rotation: number;
  isFlipping: boolean;
}

const GRAVITY = 0.5;
const JUMP_FORCE = -11;
const GROUND_Y = 200;
const CAT_SIZE = 36;
const CAT_HITBOX_W = 20;
const CAT_HITBOX_H = 28;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 300;

const OBSTACLE_EMOJIS: Record<string, string> = {
  rock: "🪨",
  tree: "🌲",
  ramp: "⛷️",
};

const TRICKS = ["Backflip! 🔄", "Barrel Roll! 🌀", "Cat Spin! 😸", "Paw Grab! 🐾", "Tail Whip! 💨"];

export function SkiingCatGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const lastObstacleRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [game, setGame] = useState<GameState>({
    catY: GROUND_Y,
    catVelocity: 0,
    isJumping: false,
    score: 0,
    obstacles: [],
    speed: 3,
    gameOver: false,
    trickText: null,
    trickTimer: 0,
    combo: 0,
    rotation: 0,
    isFlipping: false,
  });

  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem("ski_cat_high") || "0"); } catch { return 0; }
  });

  const jump = useCallback(() => {
    setGame((prev) => {
      if (prev.gameOver) return prev;
      if (!prev.isJumping) {
        return { ...prev, catVelocity: JUMP_FORCE, isJumping: true };
      }
      return prev;
    });
  }, []);

  const doTrick = useCallback(() => {
    setGame((prev) => {
      if (!prev.isJumping || prev.gameOver || prev.isFlipping) return prev;
      const trick = TRICKS[Math.floor(Math.random() * TRICKS.length)];
      return {
        ...prev,
        trickText: trick,
        trickTimer: 60,
        combo: prev.combo + 1,
        score: prev.score + 50 * (prev.combo + 1),
        isFlipping: true,
        rotation: 0,
      };
    });
  }, []);

  useEffect(() => {
    if (!started) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        jump();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        doTrick();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, jump, doTrick]);

  useEffect(() => {
    if (!started) return;
    const el = canvasRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      jump();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        doTrick();
      }
      touchStartRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [started, jump, doTrick]);

  useEffect(() => {
    if (!started || game.gameOver) return;

    const loop = () => {
      setGame((prev) => {
        if (prev.gameOver) return prev;

        let newY = prev.catY + prev.catVelocity;
        let newVel = prev.catVelocity + GRAVITY;
        let isJumping = prev.isJumping;
        let combo = prev.combo;
        let isFlipping = prev.isFlipping;
        let rotation = prev.rotation;

        if (newY >= GROUND_Y) {
          newY = GROUND_Y;
          newVel = 0;
          isJumping = false;
          combo = 0;
          isFlipping = false;
          rotation = 0;
        }

        if (isFlipping) {
          rotation += 15;
          if (rotation >= 360) {
            rotation = 0;
            isFlipping = false;
          }
        }

        let obstacles = prev.obstacles.map((o) => ({ ...o, x: o.x - prev.speed })).filter((o) => o.x > -50);

        lastObstacleRef.current++;
        if (lastObstacleRef.current > 80 + Math.random() * 50) {
          lastObstacleRef.current = 0;
          const types: Array<"rock" | "tree" | "ramp"> = ["rock", "tree", "ramp"];
          const type = types[Math.floor(Math.random() * types.length)];
          obstacles.push({
            id: Date.now(),
            x: GAME_WIDTH + 20,
            type,
            height: type === "ramp" ? 12 : type === "tree" ? 30 : 18,
            width: type === "tree" ? 20 : 24,
          });
        }

        // Collision - use smaller hitbox centered on cat
        let gameOver = false;
        const catCenterX = 60 + CAT_SIZE / 2;
        const catCenterY = newY + CAT_SIZE / 2;
        const catLeft = catCenterX - CAT_HITBOX_W / 2;
        const catRight = catCenterX + CAT_HITBOX_W / 2;
        const catTop = catCenterY - CAT_HITBOX_H / 2;
        const catBottom = catCenterY + CAT_HITBOX_H / 2;

        for (const obs of obstacles) {
          const obsLeft = obs.x + 4;
          const obsRight = obs.x + obs.width - 4;
          const obsTop = GROUND_Y + CAT_SIZE - obs.height;

          if (catRight > obsLeft && catLeft < obsRight && catBottom > obsTop + 4) {
            if (obs.type === "ramp" && isJumping) {
              newVel = JUMP_FORCE * 1.2;
            } else if (obs.type !== "ramp") {
              gameOver = true;
            }
          }
        }

        const newScore = prev.score + 1;
        const newSpeed = 3 + Math.floor(newScore / 400) * 0.5;

        let trickText = prev.trickText;
        let trickTimer = prev.trickTimer - 1;
        if (trickTimer <= 0) {
          trickText = null;
          trickTimer = 0;
        }

        if (gameOver) {
          const best = Math.max(newScore, parseInt(localStorage.getItem("ski_cat_high") || "0"));
          localStorage.setItem("ski_cat_high", String(best));
          setHighScore(best);
        }

        return {
          ...prev,
          catY: newY,
          catVelocity: newVel,
          isJumping,
          score: newScore,
          obstacles,
          speed: Math.min(newSpeed, 7),
          gameOver,
          trickText,
          trickTimer,
          combo,
          rotation,
          isFlipping,
        };
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [started, game.gameOver]);

  const restart = () => {
    lastObstacleRef.current = 0;
    setGame({
      catY: GROUND_Y,
      catVelocity: 0,
      isJumping: false,
      score: 0,
      obstacles: [],
      speed: 3,
      gameOver: false,
      trickText: null,
      trickTimer: 0,
      combo: 0,
      rotation: 0,
      isFlipping: false,
    });
    setStarted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md mx-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div
          ref={canvasRef}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-sky-200 to-white dark:from-sky-900 dark:to-background mx-auto"
          style={{ width: "100%", height: GAME_HEIGHT + 60, maxWidth: GAME_WIDTH }}
        >
          <div className="absolute bottom-16 left-0 right-0 text-6xl text-center opacity-20 select-none pointer-events-none">
            🏔️🏔️🏔️
          </div>

          <div
            className="absolute left-0 right-0 bg-gradient-to-t from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900/50"
            style={{ bottom: 0, height: 56 }}
          />
          <div
            className="absolute left-0 right-0 border-t-2 border-blue-200 dark:border-blue-700"
            style={{ bottom: 56 }}
          />

          <div className="absolute top-3 left-3 flex items-center gap-3">
            <span className="text-xs font-bold text-foreground bg-background/60 rounded-full px-2 py-0.5">
              Score: {game.score}
            </span>
            {game.combo > 1 && (
              <span className="text-xs font-bold text-primary animate-pulse">
                x{game.combo} Combo!
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-[10px] text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
              Best: {highScore}
            </span>
          </div>

          <AnimatePresence>
            {game.trickText && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-12 left-1/2 -translate-x-1/2 text-sm font-bold text-primary z-10"
              >
                {game.trickText}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="absolute text-3xl select-none"
            style={{
              left: 60,
              top: game.catY,
              transform: `rotate(${game.rotation}deg)`,
              zIndex: 10,
            }}
          >
            🐱⛷️
          </div>

          {game.obstacles.map((obs) => (
            <div
              key={obs.id}
              className="absolute text-2xl select-none"
              style={{
                left: obs.x,
                top: GROUND_Y + CAT_SIZE - obs.height,
              }}
            >
              {OBSTACLE_EMOJIS[obs.type]}
            </div>
          ))}

          {!started && !game.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-20">
              <span className="text-5xl mb-3">🐱⛷️</span>
              <h2 className="text-lg font-bold text-foreground mb-1">Ski Cat!</h2>
              <p className="text-[10px] text-muted-foreground mb-4 text-center px-8">
                ↑ / Space / Tap to jump • ← → ↓ / Swipe for tricks
              </p>
              <Button size="sm" onClick={() => setStarted(true)} className="rounded-full px-6">
                Start Skiing! 🎿
              </Button>
            </div>
          )}

          {game.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm z-20">
              <span className="text-4xl mb-2">😿</span>
              <h2 className="text-lg font-bold text-foreground mb-1">Wipeout!</h2>
              <p className="text-sm text-muted-foreground mb-1">Score: {game.score}</p>
              {game.score >= highScore && game.score > 0 && (
                <p className="text-xs font-bold text-primary mb-2">🏆 New High Score!</p>
              )}
              <Button size="sm" onClick={restart} className="rounded-full px-6">
                Try Again 🔄
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
