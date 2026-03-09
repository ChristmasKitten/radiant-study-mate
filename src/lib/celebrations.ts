// @ts-ignore
import confetti from "canvas-confetti";

export function fireSessionComplete() {
  const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 9999 };

  confetti({ ...defaults, particleCount: 50, origin: { x: 0.5, y: 0.5 }, scalar: 1.2 });

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.3, y: 0.6 } });
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.7, y: 0.6 } });
  }, 200);
}

export function fireLevelUp() {
  const end = Date.now() + 2000;
  const colors = ["#ffd700", "#ff6b6b", "#48dbfb", "#ff9ff3", "#54a0ff"];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.6 },
      colors,
      zIndex: 9999,
      startVelocity: 35,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.6 },
      colors,
      zIndex: 9999,
      startVelocity: 35,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function fireItemUnlock() {
  confetti({
    particleCount: 40,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#ffd700", "#ffed4e", "#fbbf24", "#f59e0b"],
    zIndex: 9999,
    startVelocity: 20,
    ticks: 50,
    scalar: 0.9,
  });
}

export function fireBadgeUnlock() {
  const colors = ["#a855f7", "#ec4899", "#f43f5e", "#ffd700"];
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors,
    zIndex: 9999,
    startVelocity: 30,
    ticks: 80,
  });
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: 0.4, y: 0.4 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: 0.6, y: 0.4 },
      colors,
      zIndex: 9999,
    });
  }, 250);
}
