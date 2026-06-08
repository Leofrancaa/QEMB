// Helpers de Realtime: canal por sala, broadcast tipado e presence.

import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import type { GameState, RoomEvent } from "@/types/game";

const BROADCAST_EVENT = "room_event";

export interface PresenceMeta {
  clientId: string;
  nickname: string;
  emoji: string;
}

export interface RoomChannelHandlers {
  onEvent: (event: RoomEvent) => void;
  onPresence?: (online: PresenceMeta[]) => void;
}

export interface RoomChannel {
  channel: RealtimeChannel;
  /** Envia um evento para todos na sala. */
  broadcast: (event: RoomEvent) => void;
  /** Atalho para broadcast do snapshot completo. */
  sync: (state: GameState) => void;
  leave: () => void;
}

/**
 * Inscreve no canal da sala. Recebe eventos (sync/reaction) e presença.
 * Retorna helpers para emitir eventos e sair.
 */
export function joinRoomChannel(
  code: string,
  me: PresenceMeta,
  handlers: RoomChannelHandlers,
): RoomChannel {
  const supabase = getSupabase();
  const channel = supabase.channel(`room:${code}`, {
    config: { broadcast: { self: false }, presence: { key: me.clientId } },
  });

  channel.on("broadcast", { event: BROADCAST_EVENT }, ({ payload }) => {
    handlers.onEvent(payload as RoomEvent);
  });

  if (handlers.onPresence) {
    const emitPresence = () => {
      const state = channel.presenceState<PresenceMeta>();
      const online = Object.values(state)
        .flat()
        .map((p) => ({ clientId: p.clientId, nickname: p.nickname, emoji: p.emoji }));
      handlers.onPresence!(online);
    };
    channel.on("presence", { event: "sync" }, emitPresence);
    channel.on("presence", { event: "join" }, emitPresence);
    channel.on("presence", { event: "leave" }, emitPresence);
  }

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.track(me);
    }
  });

  const broadcast = (event: RoomEvent) => {
    channel.send({ type: "broadcast", event: BROADCAST_EVENT, payload: event });
  };

  return {
    channel,
    broadcast,
    sync: (state: GameState) => broadcast({ type: "sync", state }),
    leave: () => {
      channel.untrack();
      getSupabase().removeChannel(channel);
    },
  };
}
