"use client";

import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { Lobby } from "@/components/phases/Lobby";
import { RoundIntro } from "@/components/phases/RoundIntro";
import { Writing } from "@/components/phases/Writing";
import { Reveal } from "@/components/phases/Reveal";
import { Voting } from "@/components/phases/Voting";
import { Result } from "@/components/phases/Result";
import { GameOver } from "@/components/phases/GameOver";
import { FloatingReactions, ReactionBar } from "@/components/EmojiReactions";
import { Button } from "@/components/ui/Button";

const REACTION_PHASES = new Set(["writing", "reveal", "voting", "round_result"]);

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toUpperCase();
  const game = useRoom(code);
  const { state, loading, error, react } = game;

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="animate-pulse font-display text-stroke text-4xl text-cyan">
          conectando... 🔌
        </p>
      </main>
    );
  }

  if (error || !state) {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-display text-stroke text-4xl text-tangerine">Ops! 😬</p>
        <p className="font-bold text-white/70">{error ?? "Sala não encontrada."}</p>
        <Button variant="secondary" onClick={() => router.push("/")}>
          Voltar pro início
        </Button>
      </main>
    );
  }

  const showReactions = REACTION_PHASES.has(state.phase);

  return (
    <main className="relative flex flex-1 flex-col px-4 pb-24 pt-4">
      {/* Header */}
      <div className="mx-auto mb-4 flex w-full max-w-md items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-bold"
        >
          ← sair
        </button>
        <span className="font-display text-stroke text-2xl tracking-widest text-sunny">
          {state.code}
        </span>
        <span className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-bold">
          {state.currentRound > 0
            ? `R${state.currentRound}/${state.totalRounds}`
            : `${state.totalRounds} rodadas`}
        </span>
      </div>

      <div className="flex w-full flex-1 flex-col">
        <PhaseView game={game} />
      </div>

      <FloatingReactions />
      {showReactions && <ReactionBar onReact={react} />}
    </main>
  );
}

function PhaseView({ game }: { game: ReturnType<typeof useRoom> }) {
  switch (game.state?.phase) {
    case "lobby":
      return <Lobby game={game} />;
    case "round_intro":
      return <RoundIntro game={game} />;
    case "writing":
      return <Writing game={game} />;
    case "reveal":
      return <Reveal game={game} />;
    case "voting":
      return <Voting game={game} />;
    case "round_result":
      return <Result game={game} />;
    case "game_over":
      return <GameOver game={game} />;
    default:
      return null;
  }
}
