interface Props {
  size?: "md" | "lg";
}

/** Marca textual do jogo (logo provisória até gerar a oficial). */
export function Wordmark({ size = "lg" }: Props) {
  const big = size === "lg";
  return (
    <div className="select-none text-center leading-[0.85]">
      <div
        className={`font-display text-stroke ${big ? "text-5xl" : "text-3xl"}`}
      >
        <span className="text-sunny">QUEM É</span>
      </div>
      <div
        className={`font-display text-stroke ${big ? "text-7xl" : "text-5xl"}`}
      >
        <span className="text-magenta">MAIS</span>{" "}
        <span className="text-cyan">BRABO</span>
        <span className="text-lime"> 🔥</span>
      </div>
    </div>
  );
}
