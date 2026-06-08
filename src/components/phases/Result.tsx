"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confetti } from "@/components/ui/Confetti";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import { nextRound } from "@/app/actions/round";
import { findPlayer, revealQueue } from "@/lib/derive";
import { sameName } from "@/lib/text";
import type { UseRoom } from "@/hooks/useRoom";

export function Result({ game }: { game: UseRoom }) {
  const { state, clientId, isHost, run } = game;
  if (!state?.round || !state.result) return null;

  const { winnerIds, tally, pointsAwarded } = state.result;
  const winners = winnerIds.map((id) => findPlayer(state, id)).filter(Boolean);
  const isLastRound = state.currentRound >= state.totalRounds;
  const queue = revealQueue(state);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Confetti fire={winners.length > 0} />

      <div className="text-center">
        <p className="font-bold uppercase tracking-widest text-white/60">
          O mais brabo da rodada
        </p>
        {winners.length === 1 ? (
          <motion.div
            initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            className="mt-2 flex flex-col items-center"
          >
            <div className="text-6xl">{winners[0]!.emoji}</div>
            <p className="font-display text-stroke text-4xl text-sunny">
              {winners[0]!.nickname}
            </p>
            <p className="font-bold text-cyan">+{pointsAwarded} ponto(s) 🏆</p>
          </motion.div>
        ) : winners.length > 1 ? (
          <p className="mt-2 font-display text-stroke text-3xl text-sunny">
            Empate! 🤝 (+{pointsAwarded} cada)
          </p>
        ) : (
          <p className="mt-2 font-bold text-white/60">Ninguém votou 🦗</p>
        )}
      </div>

      {/* O que cada um revelou + votos + "banco" */}
      <Card>
        <p className="mb-2 font-bold">Os escolhidos 👇</p>
        <ul className="flex flex-col gap-2">
          {queue.map((a) => {
            const player = findPlayer(state, a.playerId);
            if (!player || !a.revealedName) return null;
            const votes = tally[a.playerId] ?? 0;
            const bench = a.names.filter((n) => !sameName(n, a.revealedName!));
            return (
              <li key={a.playerId} className="rounded-2xl bg-black/20 px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar player={player} size="sm" />
                    <span className="font-extrabold text-sunny">
                      {a.revealedName} {a.challenged && "💀"}
                    </span>
                  </div>
                  <span className="font-bold text-cyan">
                    {votes} {votes === 1 ? "voto" : "votos"}
                  </span>
                </div>
                {bench.length > 0 && (
                  <p className="mt-1 pl-9 text-xs text-white/40">
                    no banco: {bench.join(", ")}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <p className="mb-2 font-bold">Placar geral 📊</p>
        <ScoreBoard state={state} highlightIds={winnerIds} />
      </Card>

      {isHost ? (
        <Button
          variant="primary"
          className="w-full"
          onClick={() => run(nextRound(state.code, clientId))}
        >
          {isLastRound ? "Ver resultado final 🏆" : "Próxima rodada ▶️"}
        </Button>
      ) : (
        <p className="text-center font-bold text-white/70">
          Aguardando o host... ⏳
        </p>
      )}
    </div>
  );
}
