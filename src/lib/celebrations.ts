// @ts-ignore
import confetti from "canvas-confetti";

export function fireSessionComplete(equippedCelebration?: string) {
  if (equippedCelebration === "effect_fireworks") {
    fireFireworks();
    return;
  }
  if (equippedCelebration === "effect_aurora") {
    fireAurora();
    return;
  }
  if (equippedCelebration === "effect_confetti_pro") {
    fireProConfetti();
    return;
  }

  const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 9999 };
  confetti({ ...defaults, particleCount: 50, origin: { x: 0.5, y: 0.5 }, scalar: 1.2 });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.3, y: 0.6 } });
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.7, y: 0.6 } });
  }, 200);
}

function fireProConfetti() {
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100 + i * 20,
        origin: { x: 0.2 + Math.random() * 0.6, y: 0.3 + Math.random() * 0.4 },
        colors,
        zIndex: 9999,
        startVelocity: 30 + i * 5,
        ticks: 80,
        scalar: 1.2,
      });
    }, i * 150);
  }
}

function fireFireworks() {
  const colors = ["#ffd700", "#ff6b6b", "#48dbfb", "#ff9ff3", "#54a0ff", "#ff4757"];
  const end = Date.now() + 3000;
  (function frame() {
    confetti({
      particleCount: 8,
      angle: 60 + Math.random() * 60,
      spread: 80,
      origin: { x: Math.random(), y: Math.random() * 0.6 },
      colors,
      zIndex: 9999,
      startVelocity: 45,
      gravity: 1.2,
      ticks: 100,
      scalar: 1.1,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function fireAurora() {
  const auroraColors = ["#00ffaa", "#00ddff", "#aa44ff", "#ff44aa", "#44ffaa"];
  const end = Date.now() + 4000;
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 90,
      spread: 160,
      origin: { x: Math.random(), y: -0.1 },
      colors: auroraColors,
      zIndex: 9999,
      startVelocity: 10,
      gravity: 0.3,
      ticks: 200,
      scalar: 2,
      drift: (Math.random() - 0.5) * 2,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
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
