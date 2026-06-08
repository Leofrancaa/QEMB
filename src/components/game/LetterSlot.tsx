"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ALL_LETTERS } from "@/lib/letters";

interface Props {
  letter: string;
  /** ms girando antes de travar na letra. */
  spinMs?: number;
  big?: boolean;
}

/** Caça-níquel: gira letras aleatórias e trava na letra da rodada. */
export function LetterSlot({ letter, spinMs = 1400, big = true }: Props) {
  const [display, setDisplay] = useState(letter);
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    setSpinning(true);
    const interval = setInterval(() => {
      setDisplay(ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]);
    }, 70);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplay(letter);
      setSpinning(false);
    }, spinMs);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [letter, spinMs]);

  return (
    <motion.div
      animate={spinning ? { y: [0, -6, 0] } : { scale: [1, 1.25, 1] }}
      transition={spinning ? { repeat: Infinity, duration: 0.2 } : { duration: 0.5 }}
      className={`flex items-center justify-center rounded-3xl bg-gradient-to-br from-sunny to-tangerine font-display text-stroke text-ink shadow-2xl ${
        big ? "h-44 w-44 text-9xl" : "h-24 w-24 text-6xl"
      }`}
    >
      {display}
    </motion.div>
  );
}
