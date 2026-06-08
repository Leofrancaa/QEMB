// Monta o GameState completo a partir do banco. Usado pelas server actions.
import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { answers, players, rooms, rounds, votes } from "@/db/schema";
import { iconForModifier } from "./modifiers";
import type {
  AnswerState,
  GameState,
  Phase,
  PlayerState,
  RoundResult,
  VoteState,
} from "@/types/game";

/** Calcula vencedor(es) e contagem de votos da rodada. */
export function tallyVotes(
  voteList: VoteState[],
  pointValue: number,
): RoundResult {
  const tally: Record<string, number> = {};
  for (const v of voteList) {
    tally[v.targetId] = (tally[v.targetId] ?? 0) + 1;
  }
  let max = 0;
  for (const count of Object.values(tally)) max = Math.max(max, count);
  const winnerIds =
    max > 0
      ? Object.entries(tally)
          .filter(([, c]) => c === max)
          .map(([id]) => id)
      : [];
  return { winnerIds, tally, pointsAwarded: pointValue };
}

/** Lê tudo de uma sala (por código) e devolve o snapshot do jogo. */
export async function buildState(code: string): Promise<GameState | null> {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
  if (!room) return null;

  const playerRows = await db
    .select()
    .from(players)
    .where(eq(players.roomId, room.id))
    .orderBy(players.joinedAt);

  // mapa db-uuid -> clientId (id público usado no GameState)
  const idToClient = new Map(playerRows.map((p) => [p.id, p.clientId]));

  const playerStates: PlayerState[] = playerRows.map((p) => ({
    id: p.clientId,
    nickname: p.nickname,
    emoji: p.emoji,
    score: p.score,
    isHost: p.isHost,
    connected: p.connected,
  }));

  let roundState: GameState["round"] = null;
  let answerStates: AnswerState[] = [];
  let voteStates: VoteState[] = [];
  let result: RoundResult | null = null;

  if (room.currentRound > 0) {
    const [round] = await db
      .select()
      .from(rounds)
      .where(
        and(eq(rounds.roomId, room.id), eq(rounds.roundNumber, room.currentRound)),
      );

    if (round) {
      roundState = {
        roundNumber: round.roundNumber,
        letter: round.letter,
        modifier: round.modifier,
        pointValue: round.pointValue,
      };

      const answerRows = await db
        .select()
        .from(answers)
        .where(eq(answers.roundId, round.id));

      answerStates = answerRows
        .map((a) => ({
          playerId: idToClient.get(a.playerId) ?? a.playerId,
          names: a.names ?? [],
          finishedAt: a.finishedAt ? a.finishedAt.getTime() : null,
          revealedName: a.revealedName,
          challenged: a.challenged,
        }))
        // ordem da fila: quem terminou primeiro aparece primeiro (nulls no fim)
        .sort((x, y) => {
          if (x.finishedAt === null) return 1;
          if (y.finishedAt === null) return -1;
          return x.finishedAt - y.finishedAt;
        });

      const voteRows = await db
        .select()
        .from(votes)
        .where(eq(votes.roundId, round.id));

      voteStates = voteRows.map((v) => ({
        voterId: idToClient.get(v.voterId) ?? v.voterId,
        targetId: idToClient.get(v.targetId) ?? v.targetId,
      }));

      if (room.phase === "round_result" || room.phase === "game_over") {
        result = tallyVotes(voteStates, round.pointValue);
      }
    }
  }

  // reidrata ícone no modifier label (apenas display fica no client)
  if (roundState) iconForModifier(roundState.modifier);

  return {
    code: room.code,
    phase: room.phase as Phase,
    totalRounds: room.totalRounds,
    currentRound: room.currentRound,
    hostId: room.hostId,
    players: playerStates,
    round: roundState,
    answers: answerStates,
    votes: voteStates,
    result,
    phaseEndsAt: room.phaseEndsAt ? room.phaseEndsAt.getTime() : null,
  };
}
