// Funções puras que derivam informações do GameState (usadas na UI).

import type { AnswerState, GameState, PlayerState } from "@/types/game";
import { sameName } from "./text";

export function findPlayer(state: GameState, id: string): PlayerState | undefined {
  return state.players.find((p) => p.id === id);
}

export function answerFor(state: GameState, playerId: string): AnswerState | undefined {
  return state.answers.find((a) => a.playerId === playerId);
}

/** Fila de revelação (já ordenada por quem terminou primeiro). */
export function revealQueue(state: GameState): AnswerState[] {
  return state.answers.filter((a) => a.finishedAt !== null);
}

/** playerId de quem deve revelar agora (ou null se ninguém). */
export function currentRevealPlayerId(state: GameState): string | null {
  const next = revealQueue(state).find((a) => a.revealedName === null);
  return next?.playerId ?? null;
}

/** Nomes já revelados (para bloquear repetição). */
export function takenNames(state: GameState): string[] {
  return revealQueue(state)
    .map((a) => a.revealedName)
    .filter((n): n is string => Boolean(n));
}

export function isNameTaken(state: GameState, name: string): boolean {
  return takenNames(state).some((t) => sameName(t, name));
}

/** Jogadores que já revelaram um nome (alvos válidos de voto). */
export function revealedPlayers(
  state: GameState,
): { player: PlayerState; name: string; challenged: boolean }[] {
  return revealQueue(state)
    .filter((a) => a.revealedName)
    .map((a) => ({
      player: findPlayer(state, a.playerId)!,
      name: a.revealedName as string,
      challenged: a.challenged,
    }))
    .filter((x) => x.player);
}

export function hasVoted(state: GameState, clientId: string): boolean {
  return state.votes.some((v) => v.voterId === clientId);
}

export function myVoteTarget(state: GameState, clientId: string): string | null {
  return state.votes.find((v) => v.voterId === clientId)?.targetId ?? null;
}

export function connectedPlayers(state: GameState): PlayerState[] {
  return state.players.filter((p) => p.connected);
}

/** Placar ordenado (maior primeiro). */
export function scoreboard(state: GameState): PlayerState[] {
  return [...state.players].sort((a, b) => b.score - a.score);
}

export function finishedCount(state: GameState): number {
  return revealQueue(state).length;
}
