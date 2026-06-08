"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { scoreboard } from "@/lib/derive";
import type { GameState } from "@/types/game";

export function ScoreBoard({
  state,
  highlightIds = [],
}: {
  state: GameState;
  highlightIds?: string[];
}) {
  const ranked = scoreboard(state);
  return (
    <ul className="flex flex-col gap-2">
      {ranked.map((p, i) => (
        <motion.li
          key={p.id}
          layout
          className={`flex items-center justify-between rounded-2xl px-3 py-2 ${
            highlightIds.includes(p.id)
              ? "bg-sunny/20 ring-2 ring-sunny"
              : "bg-black/20"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 text-center font-display text-xl text-white/50">
              {i + 1}
            </span>
            <Avatar player={p} size="sm" showName />
          </div>
          <span className="font-display text-2xl text-stroke text-sunny">
            {p.score}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
