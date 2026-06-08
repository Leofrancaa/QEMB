"use client";

// Camada de reações: emojis sobem flutuando + barra para mandar reação.

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { REACTION_EMOJIS } from "@/types/game";

export function FloatingReactions() {
  const reactions = useGameStore((s) => s.reactions);
  const removeReaction = useGameStore((s) => s.removeReaction);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -260, scale: 1.6 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            onAnimationComplete={() => removeReaction(r.id)}
            style={{ left: `${10 + Math.random() * 80}%` }}
            className="absolute bottom-24 text-5xl drop-shadow-lg"
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ReactionBar({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center gap-1 bg-gradient-to-t from-black/40 to-transparent px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3">
      {REACTION_EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => onReact(e)}
          className="rounded-full bg-white/10 px-3 py-1.5 text-2xl transition-transform active:scale-90"
        >
          {e}
        </button>
      ))}
    </div>
  );
}
