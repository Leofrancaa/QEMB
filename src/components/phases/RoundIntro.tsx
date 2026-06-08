"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LetterSlot } from "@/components/game/LetterSlot";
import { ModifierCard } from "@/components/game/ModifierCard";
import { startWriting } from "@/app/actions/round";
import type { UseRoom } from "@/hooks/useRoom";

const INTRO_MS = 4200;

export function RoundIntro({ game }: { game: UseRoom }) {
  const { state, clientId, isHost, run } = game;
  const startedRef = useRef(false);

  // host dispara a fase de escrita depois da animação
  useEffect(() => {
    if (!isHost || !state) return;
    startedRef.current = false;
    const t = setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        run(startWriting(state.code, clientId));
      }
    }, INTRO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.currentRound, isHost]);

  if (!state?.round) return null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 text-center">
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-stroke text-4xl text-cyan"
      >
        Rodada {state.round.roundNumber}/{state.totalRounds}
      </motion.p>

      <p className="text-lg font-bold text-white/70">A letra é...</p>
      <LetterSlot letter={state.round.letter} />

      <ModifierCard
        modifier={state.round.modifier}
        pointValue={state.round.pointValue}
      />

      <p className="font-bold text-white/60">
        {isHost ? "Prepara que já vai começar! 🏁" : "Aguarda o host... 🏁"}
      </p>
    </div>
  );
}
