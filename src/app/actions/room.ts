"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { answers, players, rooms, rounds, votes } from "@/db/schema";
import { buildState } from "@/lib/buildState";
import { generateRoomCode } from "@/lib/roomCode";
import { beginRoundTx } from "@/lib/transitions";
import {
  DEFAULT_ROUNDS,
  MAX_PLAYERS,
  MAX_ROUNDS,
  MIN_PLAYERS,
} from "@/lib/constants";
import type { ActionResult } from "@/types/game";

interface JoinInput {
  clientId: string;
  nickname: string;
  emoji: string;
}

async function state(code: string): Promise<ActionResult> {
  const s = await buildState(code);
  if (!s) return { ok: false, error: "Sala não encontrada." };
  return { ok: true, state: s };
}

/** Cria uma sala nova e adiciona o criador como host. */
export async function createRoom(
  input: JoinInput & { totalRounds: number },
): Promise<ActionResult & { code?: string }> {
  const totalRounds = Math.min(Math.max(input.totalRounds, 1), MAX_ROUNDS);

  // gera código único (tenta algumas vezes)
  let code = generateRoomCode();
  for (let i = 0; i < 5; i++) {
    const [existing] = await db.select().from(rooms).where(eq(rooms.code, code));
    if (!existing) break;
    code = generateRoomCode();
  }

  const [room] = await db
    .insert(rooms)
    .values({
      code,
      hostId: input.clientId,
      phase: "lobby",
      totalRounds: totalRounds || DEFAULT_ROUNDS,
      currentRound: 0,
    })
    .returning();

  await db.insert(players).values({
    clientId: input.clientId,
    roomId: room.id,
    nickname: input.nickname,
    emoji: input.emoji,
    isHost: true,
  });

  const result = await state(code);
  return { ...result, code };
}

/** Entra numa sala existente (ou reconecta se já era jogador). */
export async function joinRoom(
  code: string,
  input: JoinInput,
): Promise<ActionResult> {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
  if (!room) return { ok: false, error: "Sala não encontrada." };

  const existingPlayers = await db
    .select()
    .from(players)
    .where(eq(players.roomId, room.id));

  const already = existingPlayers.find((p) => p.clientId === input.clientId);

  if (already) {
    // reconexão: marca conectado e atualiza apelido/emoji
    await db
      .update(players)
      .set({ connected: true, nickname: input.nickname, emoji: input.emoji })
      .where(eq(players.id, already.id));
    return state(code);
  }

  if (room.phase !== "lobby") {
    return { ok: false, error: "A partida já começou." };
  }
  if (existingPlayers.length >= MAX_PLAYERS) {
    return { ok: false, error: "Sala cheia (máx. 10)." };
  }

  await db.insert(players).values({
    clientId: input.clientId,
    roomId: room.id,
    nickname: input.nickname,
    emoji: input.emoji,
  });

  return state(code);
}

/** Host define o número de rodadas (no lobby). */
export async function updateRounds(
  code: string,
  clientId: string,
  totalRounds: number,
): Promise<ActionResult> {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
  if (!room) return { ok: false, error: "Sala não encontrada." };
  if (room.hostId !== clientId) return { ok: false, error: "Só o host pode mudar." };

  await db
    .update(rooms)
    .set({ totalRounds: Math.min(Math.max(totalRounds, 1), MAX_ROUNDS) })
    .where(eq(rooms.id, room.id));

  return state(code);
}

/** Atualiza status de conexão (presence). */
export async function setConnected(
  code: string,
  clientId: string,
  connected: boolean,
): Promise<ActionResult> {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
  if (!room) return { ok: false, error: "Sala não encontrada." };

  await db
    .update(players)
    .set({ connected })
    .where(and(eq(players.roomId, room.id), eq(players.clientId, clientId)));

  return state(code);
}

/** Host inicia a partida (precisa de MIN_PLAYERS). Vai para a rodada 1. */
export async function startGame(
  code: string,
  clientId: string,
): Promise<ActionResult> {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
  if (!room) return { ok: false, error: "Sala não encontrada." };
  if (room.hostId !== clientId) return { ok: false, error: "Só o host inicia." };

  const playerRows = await db
    .select()
    .from(players)
    .where(eq(players.roomId, room.id));
  const connectedCount = playerRows.filter((p) => p.connected).length;
  if (connectedCount < MIN_PLAYERS) {
    return { ok: false, error: `Precisa de pelo menos ${MIN_PLAYERS} jogadores.` };
  }

  await beginRoundTx(room.id, 1);
  return state(code);
}

/** Revanche: zera placar e volta pro lobby (limpa rodadas). */
export async function rematch(
  code: string,
  clientId: string,
): Promise<ActionResult> {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
  if (!room) return { ok: false, error: "Sala não encontrada." };
  if (room.hostId !== clientId) return { ok: false, error: "Só o host." };

  const roundRows = await db
    .select({ id: rounds.id })
    .from(rounds)
    .where(eq(rounds.roomId, room.id));
  for (const r of roundRows) {
    await db.delete(votes).where(eq(votes.roundId, r.id));
    await db.delete(answers).where(eq(answers.roundId, r.id));
  }
  await db.delete(rounds).where(eq(rounds.roomId, room.id));

  await db
    .update(players)
    .set({ score: 0 })
    .where(eq(players.roomId, room.id));
  await db
    .update(rooms)
    .set({ phase: "lobby", currentRound: 0, phaseEndsAt: null })
    .where(eq(rooms.id, room.id));

  return state(code);
}
