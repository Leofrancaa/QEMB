"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { answers, players, rooms, rounds, votes } from "@/db/schema";
import { buildState, tallyVotes } from "@/lib/buildState";
import { beginRoundTx } from "@/lib/transitions";
import { WRITING_SECONDS } from "@/lib/constants";
import { sameName } from "@/lib/text";
import type { ActionResult } from "@/types/game";

async function out(code: string): Promise<ActionResult> {
  const s = await buildState(code);
  if (!s) return { ok: false, error: "Sala não encontrada." };
  return { ok: true, state: s };
}

/** Carrega room + rodada atual + jogador (por clientId). */
async function ctx(code: string, clientId?: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
  if (!room) return null;
  const [round] =
    room.currentRound > 0
      ? await db
          .select()
          .from(rounds)
          .where(
            and(eq(rounds.roomId, room.id), eq(rounds.roundNumber, room.currentRound)),
          )
      : [];
  const player = clientId
    ? (
        await db
          .select()
          .from(players)
          .where(and(eq(players.roomId, room.id), eq(players.clientId, clientId)))
      )[0]
    : undefined;
  return { room, round, player };
}

/** Host: começa a escrita (timer de 30s). */
export async function startWriting(code: string, clientId: string): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c) return { ok: false, error: "Sala não encontrada." };
  if (c.room.hostId !== clientId) return { ok: false, error: "Só o host." };

  const endsAt = new Date(Date.now() + WRITING_SECONDS * 1000);
  await db
    .update(rooms)
    .set({ phase: "writing", phaseEndsAt: endsAt })
    .where(eq(rooms.id, c.room.id));
  return out(code);
}

/** Jogador envia os 3 nomes ("Acabei!" ou auto no fim do tempo). */
export async function submitAnswer(
  code: string,
  clientId: string,
  names: string[],
): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c || !c.round || !c.player) return { ok: false, error: "Estado inválido." };
  if (c.room.phase !== "writing") return out(code);

  const clean = names.map((n) => n.trim()).filter((n) => n.length > 0).slice(0, 3);

  await db
    .insert(answers)
    .values({
      roundId: c.round.id,
      playerId: c.player.id,
      names: clean,
      finishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [answers.roundId, answers.playerId],
      set: { names: clean, finishedAt: new Date() },
    });

  // auto-encerra a escrita se todos os conectados já enviaram
  const playerRows = await db.select().from(players).where(eq(players.roomId, c.room.id));
  const connected = playerRows.filter((p) => p.connected).length;
  const finished = await db
    .select({ id: answers.id })
    .from(answers)
    .where(and(eq(answers.roundId, c.round.id), isNotNull(answers.finishedAt)));

  if (finished.length >= connected) {
    await db
      .update(rooms)
      .set({ phase: "reveal", phaseEndsAt: null })
      .where(and(eq(rooms.id, c.room.id), eq(rooms.phase, "writing")));
  }
  return out(code);
}

/** Host: encerra a escrita no fim do tempo. */
export async function endWriting(code: string, clientId: string): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c) return { ok: false, error: "Sala não encontrada." };
  if (c.room.hostId !== clientId) return out(code);
  if (c.room.phase !== "writing") return out(code);

  await db
    .update(rooms)
    .set({ phase: "reveal", phaseEndsAt: null })
    .where(and(eq(rooms.id, c.room.id), eq(rooms.phase, "writing")));
  return out(code);
}

/** Jogador revela 1 dos seus nomes (na sua vez, sem repetir nomes já revelados). */
export async function revealName(
  code: string,
  clientId: string,
  name: string,
): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c || !c.round || !c.player) return { ok: false, error: "Estado inválido." };
  if (c.room.phase !== "reveal") return out(code);

  const answerRows = await db
    .select()
    .from(answers)
    .where(eq(answers.roundId, c.round.id));

  const queue = answerRows
    .filter((a) => a.finishedAt !== null)
    .sort((a, b) => a.finishedAt!.getTime() - b.finishedAt!.getTime());

  const turn = queue.find((a) => a.revealedName === null);
  if (!turn || turn.playerId !== c.player.id) {
    return { ok: false, error: "Não é a sua vez." };
  }

  const mine = turn.names ?? [];
  const chosen = mine.find((n) => sameName(n, name));
  if (!chosen) return { ok: false, error: "Esse nome não é seu." };

  const taken = queue
    .filter((a) => a.revealedName)
    .map((a) => a.revealedName as string);
  if (taken.some((t) => sameName(t, chosen))) {
    return { ok: false, error: "Esse nome já foi revelado!" };
  }

  await db
    .update(answers)
    .set({ revealedName: chosen })
    .where(eq(answers.id, turn.id));

  // se foi o último a revelar, vai pra votação
  const remaining = queue.filter(
    (a) => a.id !== turn.id && a.revealedName === null,
  );
  if (remaining.length === 0) {
    await db
      .update(rooms)
      .set({ phase: "voting", phaseEndsAt: null })
      .where(and(eq(rooms.id, c.room.id), eq(rooms.phase, "reveal")));
  }
  return out(code);
}

/** Contesta o nome revelado de um jogador (badge 💀). Alterna. */
export async function challengeName(
  code: string,
  clientId: string,
  targetClientId: string,
): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c || !c.round) return { ok: false, error: "Estado inválido." };

  const [target] = await db
    .select()
    .from(players)
    .where(and(eq(players.roomId, c.room.id), eq(players.clientId, targetClientId)));
  if (!target) return out(code);

  const [ans] = await db
    .select()
    .from(answers)
    .where(and(eq(answers.roundId, c.round.id), eq(answers.playerId, target.id)));
  if (!ans) return out(code);

  await db
    .update(answers)
    .set({ challenged: !ans.challenged })
    .where(eq(answers.id, ans.id));
  return out(code);
}

/** Vota em quem é o mais brabo (não pode em si mesmo). */
export async function submitVote(
  code: string,
  clientId: string,
  targetClientId: string,
): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c || !c.round || !c.player) return { ok: false, error: "Estado inválido." };
  if (c.room.phase !== "voting") return out(code);
  if (clientId === targetClientId) return { ok: false, error: "Não pode votar em você!" };

  const [target] = await db
    .select()
    .from(players)
    .where(and(eq(players.roomId, c.room.id), eq(players.clientId, targetClientId)));
  if (!target) return { ok: false, error: "Jogador inválido." };

  // alvo precisa ter revelado um nome
  const [targetAnswer] = await db
    .select()
    .from(answers)
    .where(and(eq(answers.roundId, c.round.id), eq(answers.playerId, target.id)));
  if (!targetAnswer?.revealedName) {
    return { ok: false, error: "Esse jogador não revelou nome." };
  }

  await db
    .insert(votes)
    .values({ roundId: c.round.id, voterId: c.player.id, targetId: target.id })
    .onConflictDoUpdate({
      target: [votes.roundId, votes.voterId],
      set: { targetId: target.id },
    });

  // todos os conectados votaram? encerra a votação
  const playerRows = await db.select().from(players).where(eq(players.roomId, c.room.id));
  const connected = playerRows.filter((p) => p.connected).length;
  const voteRows = await db
    .select({ id: votes.id })
    .from(votes)
    .where(eq(votes.roundId, c.round.id));

  if (voteRows.length >= connected) {
    await finalizeVoting(code);
  }
  return out(code);
}

/** Apura votos, dá pontos e vai para o resultado. Idempotente. */
async function finalizeVoting(code: string): Promise<void> {
  const c = await ctx(code);
  if (!c || !c.round) return;
  if (c.room.phase !== "voting") return;

  const voteRows = await db.select().from(votes).where(eq(votes.roundId, c.round.id));
  const playerRows = await db.select().from(players).where(eq(players.roomId, c.room.id));
  const idToClient = new Map(playerRows.map((p) => [p.id, p.clientId]));

  const voteStates = voteRows.map((v) => ({
    voterId: idToClient.get(v.voterId) ?? v.voterId,
    targetId: idToClient.get(v.targetId) ?? v.targetId,
  }));

  const result = tallyVotes(voteStates, c.round.pointValue);

  // dá pontos aos vencedores
  for (const winnerClientId of result.winnerIds) {
    const winner = playerRows.find((p) => p.clientId === winnerClientId);
    if (winner) {
      await db
        .update(players)
        .set({ score: winner.score + result.pointsAwarded })
        .where(eq(players.id, winner.id));
    }
  }

  await db
    .update(rooms)
    .set({ phase: "round_result", phaseEndsAt: null })
    .where(and(eq(rooms.id, c.room.id), eq(rooms.phase, "voting")));
}

/** Host: força o fim da votação. */
export async function endVoting(code: string, clientId: string): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c) return { ok: false, error: "Sala não encontrada." };
  if (c.room.hostId !== clientId) return out(code);
  await finalizeVoting(code);
  return out(code);
}

/** Host: avança para a próxima rodada ou encerra o jogo. */
export async function nextRound(code: string, clientId: string): Promise<ActionResult> {
  const c = await ctx(code, clientId);
  if (!c) return { ok: false, error: "Sala não encontrada." };
  if (c.room.hostId !== clientId) return { ok: false, error: "Só o host." };

  if (c.room.currentRound < c.room.totalRounds) {
    await beginRoundTx(c.room.id, c.room.currentRound + 1);
  } else {
    await db
      .update(rooms)
      .set({ phase: "game_over", phaseEndsAt: null })
      .where(eq(rooms.id, c.room.id));
  }
  return out(code);
}
