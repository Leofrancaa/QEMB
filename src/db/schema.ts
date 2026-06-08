// Schema do banco (Drizzle / Postgres @ Supabase)

import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  hostId: text("host_id").notNull(),
  phase: text("phase").notNull().default("lobby"),
  totalRounds: integer("total_rounds").notNull().default(5),
  currentRound: integer("current_round").notNull().default(0),
  phaseEndsAt: timestamp("phase_ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const players = pgTable(
  "players",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // ID público do jogador, gerado no client (localStorage). Identifica nas actions.
    clientId: text("client_id").notNull(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(),
    emoji: text("emoji").notNull().default("🔥"),
    score: integer("score").notNull().default(0),
    isHost: boolean("is_host").notNull().default(false),
    connected: boolean("connected").notNull().default(true),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("players_room_client").on(t.roomId, t.clientId)],
);

export const rounds = pgTable(
  "rounds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    roundNumber: integer("round_number").notNull(),
    letter: text("letter").notNull(),
    modifier: text("modifier").notNull(),
    pointValue: integer("point_value").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("rounds_room_number").on(t.roomId, t.roundNumber)],
);

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => rounds.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    names: jsonb("names").$type<string[]>().notNull().default([]),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    revealedName: text("revealed_name"),
    challenged: boolean("challenged").notNull().default(false),
  },
  (t) => [unique("answers_round_player").on(t.roundId, t.playerId)],
);

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => rounds.id, { onDelete: "cascade" }),
    voterId: uuid("voter_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
  },
  (t) => [unique("votes_round_voter").on(t.roundId, t.voterId)],
);

export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Round = typeof rounds.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Vote = typeof votes.$inferSelect;
