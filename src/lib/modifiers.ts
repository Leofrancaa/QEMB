// Modificadores aleatórios da rodada — apimentam o jogo e geram risada.

export interface Modifier {
  /** Texto exibido na "carta". */
  label: string;
  /** Emoji/ícone temático. */
  icon: string;
  /** Multiplicador de pontos (default 1). */
  pointValue?: number;
}

export const MODIFIERS: Modifier[] = [
  { label: "Não vale jogador de futebol", icon: "⚽" },
  { label: "Não vale atleta", icon: "🏅" },
  { label: "Não vale cantor(a)", icon: "🎤" },
  { label: "Não vale ator/atriz", icon: "🎬" },
  { label: "Não vale político", icon: "🏛️" },
  { label: "Só vale brasileiro(a)", icon: "🇧🇷" },
  { label: "Só vale gringo(a)", icon: "🌎" },
  { label: "Só vale mulher", icon: "👑" },
  { label: "Só vale personagem fictício", icon: "🦸" },
  { label: "Só vale lenda já falecida", icon: "👻" },
  { label: "Modo Livre (vale tudo)", icon: "🎉" },
  { label: "RODADA DOBRADA — vale 2 pontos!", icon: "💰", pointValue: 2 },
];

/**
 * Sorteia um modificador. "Modo Livre" tem peso extra para não pesar demais,
 * evitando partidas onde toda rodada é uma restrição diferente.
 */
export function drawModifier(): Modifier {
  // ~30% de chance de Modo Livre, senão sorteia entre os demais.
  if (Math.random() < 0.3) {
    return MODIFIERS.find((m) => m.label.startsWith("Modo Livre"))!;
  }
  const restritivos = MODIFIERS.filter((m) => !m.label.startsWith("Modo Livre"));
  return restritivos[Math.floor(Math.random() * restritivos.length)];
}

/** Acha o ícone de um modificador pelo label (para reidratar do banco). */
export function iconForModifier(label: string): string {
  return MODIFIERS.find((m) => m.label === label)?.icon ?? "🎲";
}
