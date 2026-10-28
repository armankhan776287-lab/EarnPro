import confetti from 'canvas-confetti';

export function fireSuccessConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ec4899'],
    });
  } catch (e) {
    // Graceful fallback if canvas is unavailable
  }
}

export function fireSuperConfetti() {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#3b82f6', '#8b5cf6', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    // Fallback
  }
}
