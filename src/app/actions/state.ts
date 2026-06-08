"use server";

import { buildState } from "@/lib/buildState";
import type { ActionResult } from "@/types/game";

/** Lê o estado atual da sala (carga inicial / reconexão). */
export async function getRoomState(code: string): Promise<ActionResult> {
  const s = await buildState(code);
  if (!s) return { ok: false, error: "Sala não encontrada." };
  return { ok: true, state: s };
}
