import type { PlayerState } from "@/types/game";

interface Props {
  player: PlayerState;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  dim?: boolean;
}

const SIZES = {
  sm: "h-9 w-9 text-lg",
  md: "h-12 w-12 text-2xl",
  lg: "h-16 w-16 text-3xl",
};

export function Avatar({ player, size = "md", showName = false, dim = false }: Props) {
  return (
    <div className={`flex items-center gap-2 ${dim ? "opacity-40" : ""}`}>
      <div
        className={`flex items-center justify-center rounded-2xl bg-grape-deep/70 ring-2 ring-white/20 ${SIZES[size]}`}
      >
        {player.emoji}
      </div>
      {showName && (
        <span className="truncate font-bold">{player.nickname}</span>
      )}
    </div>
  );
}
