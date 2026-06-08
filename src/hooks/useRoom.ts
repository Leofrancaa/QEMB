"use client";

// Hook central: conecta no Realtime da sala, sincroniza estado e expõe ações.

import { useCallback, useEffect, useRef, useState } from "react";
import { joinRoom, setConnected } from "@/app/actions/room";
import { getRoomState } from "@/app/actions/state";
import { getClientId } from "@/lib/clientId";
import { getProfile } from "@/lib/profile";
import { joinRoomChannel, type RoomChannel } from "@/lib/realtime";
import { selectMe, useGameStore } from "@/store/gameStore";
import type { ActionResult, GameState } from "@/types/game";

export interface UseRoom {
  state: GameState | null;
  clientId: string;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  /** Roda uma server action e propaga o novo estado por broadcast. */
  run: (promise: Promise<ActionResult>) => Promise<void>;
  /** Dispara uma reação em emoji para a sala. */
  react: (emoji: string) => void;
}

export function useRoom(code: string): UseRoom {
  const state = useGameStore((s) => s.state);
  const clientId = useGameStore((s) => s.clientId);
  const setState = useGameStore((s) => s.setState);
  const setClientId = useGameStore((s) => s.setClientId);
  const pushReaction = useGameStore((s) => s.pushReaction);
  const isHost = useGameStore((s) => selectMe(s)?.isHost ?? false);

  const channelRef = useRef<RoomChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // aplica resultado de action no store + broadcast
  const apply = useCallback(
    (result: ActionResult) => {
      if (result.ok) {
        setState(result.state);
        channelRef.current?.sync(result.state);
      } else {
        setError(result.error);
      }
    },
    [setState],
  );

  const run = useCallback(
    async (promise: Promise<ActionResult>) => {
      const result = await promise;
      apply(result);
    },
    [apply],
  );

  const react = useCallback(
    (emoji: string) => {
      pushReaction(emoji);
      channelRef.current?.broadcast({ type: "reaction", emoji, from: clientId });
    },
    [pushReaction, clientId],
  );

  useEffect(() => {
    let cancelled = false;
    const id = getClientId();
    const profile = getProfile();
    setClientId(id);

    async function connect() {
      // garante que o jogador existe na sala (ou reconecta)
      const joined = await joinRoom(code, {
        clientId: id,
        nickname: profile.nickname,
        emoji: profile.emoji,
      });
      if (cancelled) return;
      if (!joined.ok) {
        setError(joined.error);
        setLoading(false);
        return;
      }
      setState(joined.state);

      // abre canal Realtime
      const ch = joinRoomChannel(
        code,
        { clientId: id, nickname: profile.nickname, emoji: profile.emoji },
        {
          onEvent: (event) => {
            if (event.type === "sync") setState(event.state);
            else if (event.type === "reaction") pushReaction(event.emoji);
          },
        },
      );
      channelRef.current = ch;

      // re-sincroniza do banco (estado mais novo que o join inicial pode trazer)
      const fresh = await getRoomState(code);
      if (!cancelled && fresh.ok) setState(fresh.state);

      setLoading(false);
    }

    connect();

    const markGone = () => {
      // melhor esforço ao sair/atualizar
      void setConnected(code, id, false);
    };
    window.addEventListener("beforeunload", markGone);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", markGone);
      channelRef.current?.leave();
      channelRef.current = null;
      void setConnected(code, id, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return { state, clientId, loading, error, isHost, run, react };
}
