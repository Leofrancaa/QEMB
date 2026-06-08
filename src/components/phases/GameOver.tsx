"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confetti } from "@/components/ui/Confetti";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import { rematch } from "@/app/actions/room";
import { scoreboard } from "@/lib/derive";
import type { UseRoom } from "@/hooks/useRoom";

export function GameOver({ game }: { game: UseRoom }) {
  const { state, clientId, isHost, run } = game;
  if (!state) return null;

  const ranked = scoreboard(state);
  const topScore = ranked[0]?.score ?? 0;
  const champions = ranked.filter((p) => p.score === topScore && topScore > 0);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 text-center">
      <Confetti />
      <p className="font-display text-stroke text-3xl text-cyan">Fim de jogo!</p>

      <div>
        <p className="font-bold uppercase tracking-widest text-white/60">
          {champions.length > 1 ? "Os mais brabos 👑" : "O MAIS BRABO 👑"}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-center gap-4">
          {champions.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: 40, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="text-7xl">{p.emoji}</div>
              <p className="font-display text-stroke text-4xl text-sunny">
                {p.nickname}
              </p>
              <p className="font-bold text-cyan">{p.score} pts</p>
            </motion.div>
          ))}
          {champions.length === 0 && (
            <p className="font-bold text-white/60">Ninguém pontuou 🦗</p>
          )}
        </div>
      </div>

      <Card>
        <p className="mb-2 font-bold">Placar final 📊</p>
        <ScoreBoard
          state={state}
          highlightIds={champions.map((p) => p.id)}
        />
      </Card>

      {isHost ? (
        <Button
          variant="sunny"
          className="w-full"
          onClick={() => run(rematch(state.code, clientId))}
        >
          Revanche! 🔁
        </Button>
      ) : (
        <p className="font-bold text-white/70">
          Host pode começar a revanche 🔁
        </p>
      )}
    </div>
  );
}
