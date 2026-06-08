"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { endVoting, submitVote } from "@/app/actions/round";
import {
  connectedPlayers,
  hasVoted,
  myVoteTarget,
  revealedPlayers,
} from "@/lib/derive";
import type { UseRoom } from "@/hooks/useRoom";

export function Voting({ game }: { game: UseRoom }) {
  const { state, clientId, isHost, run } = game;
  if (!state?.round) return null;

  const candidates = revealedPlayers(state);
  const voted = hasVoted(state, clientId);
  const myTarget = myVoteTarget(state, clientId);
  const votesIn = state.votes.length;
  const total = connectedPlayers(state).length;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h2 className="text-center font-display text-stroke text-4xl text-magenta">
        Quem é o MAIS BRABO? 🔥
      </h2>
      <p className="text-center text-sm font-bold text-white/60">
        Vote no melhor (não vale votar em você!) • {votesIn}/{total} votaram
      </p>

      <ul className="flex flex-col gap-2.5">
        {candidates.map(({ player, name, challenged }) => {
          const isMe = player.id === clientId;
          const chosen = myTarget === player.id;
          return (
            <motion.li key={player.id} layout>
              <button
                disabled={isMe || voted}
                onClick={() => run(submitVote(state.code, clientId, player.id))}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-transform active:scale-[0.98] ${
                  chosen
                    ? "bg-magenta ring-2 ring-white"
                    : isMe
                      ? "cursor-not-allowed bg-white/5 opacity-50"
                      : voted
                        ? "bg-black/20"
                        : "bg-black/30 hover:bg-black/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Avatar player={player} size="sm" />
                  <div>
                    <p className="font-extrabold leading-tight text-sunny">
                      {name} {challenged && "💀"}
                    </p>
                    <p className="text-xs text-white/60">
                      {player.nickname} {isMe && "(você)"}
                    </p>
                  </div>
                </div>
                {chosen && <span className="text-2xl">✅</span>}
              </button>
            </motion.li>
          );
        })}
      </ul>

      {voted && (
        <p className="text-center font-bold text-lime">
          Voto computado! Aguardando os outros... ⏳
        </p>
      )}

      {isHost && votesIn < total && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => run(endVoting(state.code, clientId))}
        >
          Encerrar votação agora ({votesIn}/{total})
        </Button>
      )}
    </div>
  );
}
