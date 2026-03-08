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
  const end = Date.now() + 1500;
  const colors = ["#ffd700", "#ff6b6b", "#48dbfb", "#ff9ff3", "#54a0ff"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      zIndex: 9999,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
