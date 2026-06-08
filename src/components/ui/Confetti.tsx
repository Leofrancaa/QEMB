"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/** Dispara uma rajada de confete ao montar. */
export function Confetti({ fire = true }: { fire?: boolean }) {
  useEffect(() => {
    if (!fire) return;
    const colors = ["#fde047", "#ec4899", "#22d3ee", "#a3e635", "#fb7185"];
    const burst = (particleRatio: number, opts: confetti.Options) =>
      confetti({
        origin: { y: 0.6 },
        colors,
        particleCount: Math.floor(200 * particleRatio),
        ...opts,
      });

    burst(0.25, { spread: 26, startVelocity: 55 });
    burst(0.2, { spread: 60 });
    burst(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    burst(0.1, { spread: 120, startVelocity: 45 });
  }, [fire]);

  return null;
}
