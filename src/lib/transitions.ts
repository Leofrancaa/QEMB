// Transições de estado reutilizadas pelas server actions (server-only).
import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rooms, rounds } from "@/db/schema";
import { drawLetter } from "./letters";
import { drawModifier } from "./modifiers";

/** Cria a rodada N (sorteia letra + modificador) e entra na fase de intro. */
export async function beginRoundTx(roomId: string, roundNumber: number): Promise<void> {
  const letter = drawLetter();
  const modifier = drawModifier();

  await db.insert(rounds).values({
    roomId,
    roundNumber,
    letter,
    modifier: modifier.label,
    pointValue: modifier.pointValue ?? 1,
  });

  await db
    .update(rooms)
    .set({ phase: "round_intro", currentRound: roundNumber, phaseEndsAt: null })
    .where(eq(rooms.id, roomId));
}
