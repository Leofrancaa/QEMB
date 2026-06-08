"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { startGame, updateRounds } from "@/app/actions/room";
import { connectedPlayers } from "@/lib/derive";
import { MAX_ROUNDS, MIN_PLAYERS } from "@/lib/constants";
import type { UseRoom } from "@/hooks/useRoom";

export function Lobby({ game }: { game: UseRoom }) {
  const { state, clientId, isHost, run } = game;
  const [copied, setCopied] = useState(false);
  if (!state) return null;

  const connected = connectedPlayers(state).length;
  const canStart = connected >= MIN_PLAYERS;

  async function share() {
    const url = `${window.location.origin}/room/${state!.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Quem é Mais Brabo", text: "Bora jogar!", url });
        return;
      } catch {
        // usuário cancelou — cai no copiar
      }
    }
    await navigator.clipboard.writeText(state!.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Card className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-white/60">
          Código da sala
        </p>
        <button
          onClick={share}
          className="font-display text-stroke text-6xl tracking-[0.15em] text-sunny"
        >
          {state.code}
        </button>
        <p className="mt-1 text-sm text-white/60">
          {copied ? "copiado! ✅" : "toque pra compartilhar 📲"}
        </p>
      </Card>

      <Card>
        <p className="mb-2 flex items-center justify-between font-bold">
          <span>Jogadores</span>
          <span className="text-white/60">
            {connected}/{MAX_ROUNDS >= 10 ? 10 : MAX_ROUNDS}
          </span>
        </p>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2"
            >
              <Avatar player={p} showName />
              <span className="flex items-center gap-2 text-sm">
                {p.isHost && <span className="text-sunny">👑 host</span>}
                {p.id === clientId && <span className="text-cyan">você</span>}
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    p.connected ? "bg-lime" : "bg-white/30"
                  }`}
                />
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {isHost ? (
        <Card>
          <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-white/60">
            Rodadas: <span className="text-sunny">{state.totalRounds}</span>
          </label>
          <input
            type="range"
            min={1}
            max={MAX_ROUNDS}
            value={state.totalRounds}
            onChange={(e) =>
              run(updateRounds(state.code, clientId, Number(e.target.value)))
            }
            className="w-full accent-magenta"
          />
          <Button
            variant="primary"
            className="mt-3 w-full"
            disabled={!canStart}
            onClick={() => run(startGame(state.code, clientId))}
          >
            {canStart
              ? "Começar! 🔥"
              : `Faltam ${MIN_PLAYERS - connected} jogador(es)`}
          </Button>
        </Card>
      ) : (
        <p className="text-center font-bold text-white/70">
          Esperando o host começar... ⏳
        </p>
      )}
    </div>
  );
}
