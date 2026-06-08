"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { challengeName, revealName } from "@/app/actions/round";
import {
  answerFor,
  currentRevealPlayerId,
  findPlayer,
  isNameTaken,
  revealQueue,
} from "@/lib/derive";
import type { UseRoom } from "@/hooks/useRoom";

export function Reveal({ game }: { game: UseRoom }) {
  const { state, clientId, run } = game;
  if (!state?.round) return null;

  const queue = revealQueue(state);
  const turnId = currentRevealPlayerId(state);
  const myTurn = turnId === clientId;
  const myAnswer = answerFor(state, clientId);
  const turnPlayer = turnId ? findPlayer(state, turnId) : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h2 className="text-center font-display text-stroke text-3xl text-cyan">
        Hora de revelar! 🎭
      </h2>
      <p className="text-center text-sm font-bold text-white/60">
        Na ordem de quem terminou primeiro. Não pode repetir nome já revelado!
      </p>

      {/* Fila / revelados */}
      <ul className="flex flex-col gap-2">
        {queue.map((a, idx) => {
          const player = findPlayer(state, a.playerId);
          if (!player) return null;
          const isTurn = a.playerId === turnId;
          const revealed = a.revealedName;
          return (
            <motion.li
              key={a.playerId}
              layout
              className={`flex items-center justify-between rounded-2xl px-3 py-2 ${
                isTurn
                  ? "bg-cyan/20 ring-2 ring-cyan"
                  : revealed
                    ? "bg-black/20"
                    : "bg-black/10 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-xl text-white/40">{idx + 1}</span>
                <Avatar player={player} size="sm" showName />
              </div>
              <div className="flex items-center gap-2">
                {revealed ? (
                  <>
                    <span className="font-extrabold text-sunny">{revealed}</span>
                    {a.challenged && <span title="contestado">💀</span>}
                    {a.playerId !== clientId && (
                      <button
                        onClick={() =>
                          run(challengeName(state.code, clientId, a.playerId))
                        }
                        className="rounded-lg bg-white/10 px-2 py-1 text-xs font-bold"
                      >
                        {a.challenged ? "tirar 💀" : "contestar"}
                      </button>
                    )}
                  </>
                ) : isTurn ? (
                  <span className="text-sm font-bold text-cyan">revelando...</span>
                ) : (
                  <span className="text-sm text-white/40">aguardando</span>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>

      {/* Minha vez: escolher 1 dos 3 */}
      <AnimatePresence>
        {myTurn && myAnswer && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border-2 border-cyan bg-cyan/10 p-4"
          >
            <p className="mb-2 text-center font-bold text-cyan">
              Sua vez! Escolha seu mais brabo 👑
            </p>
            <div className="flex flex-col gap-2">
              {myAnswer.names.map((name) => {
                const taken = isNameTaken(state, name);
                return (
                  <button
                    key={name}
                    disabled={taken}
                    onClick={() => run(revealName(state.code, clientId, name))}
                    className={`rounded-2xl px-4 py-3 text-lg font-extrabold transition-transform active:scale-95 ${
                      taken
                        ? "cursor-not-allowed bg-white/5 text-white/30 line-through"
                        : "bg-sunny text-ink"
                    }`}
                  >
                    {name} {taken && "🚫"}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!myTurn && turnPlayer && (
        <p className="text-center font-bold text-white/70">
          {turnPlayer.emoji} {turnPlayer.nickname} está escolhendo... 🤔
        </p>
      )}
    </div>
  );
}
