// Tipos compartilhados entre client e server (fonte única de verdade do formato do estado)

export type Phase =
  | "lobby"
  | "round_intro"
  | "writing"
  | "reveal"
  | "voting"
  | "round_result"
  | "game_over";

export interface PlayerState {
  id: string;
  nickname: string;
  emoji: string;
  score: number;
  isHost: boolean;
  connected: boolean;
}

export interface AnswerState {
  playerId: string;
  /** Os 3 nomes escritos. Pode vir com menos de 3 se o tempo acabou. */
  names: string[];
  /** Momento em que apertou "Acabei" (epoch ms). null = ainda não enviou. */
  finishedAt: number | null;
  /** Nome escolhido na fase de revelação. null = ainda não revelou. */
  revealedName: string | null;
  /** Marcado como suspeito por alguém (badge 💀). */
  challenged: boolean;
}

export interface RoundState {
  roundNumber: number;
  letter: string;
  modifier: string;
  /** Vale 1 ponto normalmente; modificador "Rodada Dobrada" deixa 2. */
  pointValue: number;
}

export interface VoteState {
  voterId: string;
  targetId: string;
}

export interface RoundResult {
  /** playerId(s) vencedor(es) da rodada (empate => vários). */
  winnerIds: string[];
  /** Contagem de votos por playerId alvo. */
  tally: Record<string, number>;
  pointsAwarded: number;
}

/** Snapshot completo do jogo — enviado via Realtime e lido do banco. */
export interface GameState {
  code: string;
  phase: Phase;
  totalRounds: number;
  currentRound: number;
  hostId: string;
  players: PlayerState[];
  round: RoundState | null;
  answers: AnswerState[];
  votes: VoteState[];
  result: RoundResult | null;
  /** Quando a fase atual termina (epoch ms). Usado p/ timer da escrita. */
  phaseEndsAt: number | null;
}

/** Eventos trafegados no canal Realtime da sala. */
export type RoomEvent =
  | { type: "sync"; state: GameState }
  | { type: "reaction"; emoji: string; from: string };

export const REACTION_EMOJIS = ["😂", "🔥", "💀", "👑", "🤡", "👏"] as const;

/** Resultado padrão das server actions. */
export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };
