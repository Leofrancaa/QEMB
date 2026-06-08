// Store global do jogo no client (Zustand).

import { create } from "zustand";
import type { GameState } from "@/types/game";

interface FloatingReaction {
  id: number;
  emoji: string;
}

interface GameStore {
  state: GameState | null;
  /** Identidade deste jogador neste navegador. */
  clientId: string;
  /** Reações flutuando na tela (efeito visual). */
  reactions: FloatingReaction[];

  setState: (state: GameState) => void;
  setClientId: (id: string) => void;
  pushReaction: (emoji: string) => void;
  removeReaction: (id: number) => void;
  reset: () => void;
}

let reactionSeq = 0;

export const useGameStore = create<GameStore>((set) => ({
  state: null,
  clientId: "",
  reactions: [],

  setState: (state) => set({ state }),
  setClientId: (clientId) => set({ clientId }),
  pushReaction: (emoji) =>
    set((s) => ({
      reactions: [...s.reactions, { id: ++reactionSeq, emoji }],
    })),
  removeReaction: (id) =>
    set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })),
  reset: () => set({ state: null, reactions: [] }),
}));

/** Seletor: o jogador atual dentro do estado. */
export function selectMe(s: GameStore) {
  return s.state?.players.find((p) => p.id === s.clientId) ?? null;
}
