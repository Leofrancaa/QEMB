"use client";

import { motion } from "framer-motion";
import { iconForModifier } from "@/lib/modifiers";

interface Props {
  modifier: string;
  pointValue: number;
  compact?: boolean;
}

export function ModifierCard({ modifier, pointValue, compact = false }: Props) {
  const icon = iconForModifier(modifier);
  const doubled = pointValue > 1;

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: compact ? 0 : 0.3 }}
      className={`w-full rounded-2xl border-2 text-center ${
        doubled
          ? "border-sunny bg-sunny/15"
          : "border-white/25 bg-white/10"
      } ${compact ? "px-3 py-2" : "px-4 py-4"}`}
    >
      <div className="flex items-center justify-center gap-2">
        <span className={compact ? "text-2xl" : "text-4xl"}>{icon}</span>
        <span
          className={`font-extrabold ${compact ? "text-sm" : "text-lg"} ${
            doubled ? "text-sunny" : "text-white"
          }`}
        >
          {modifier}
        </span>
      </div>
      {!compact && (
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
          Modificador da rodada
        </p>
      )}
    </motion.div>
  );
}
