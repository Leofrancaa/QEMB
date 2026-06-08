// Sorteio da letra da rodada, com peso menor para letras difíceis.

interface WeightedLetter {
  letter: string;
  weight: number;
}

// Letras comuns têm peso alto; K/W/X/Y são raras (e cruéis), peso baixo.
const LETTER_WEIGHTS: WeightedLetter[] = [
  { letter: "A", weight: 10 },
  { letter: "B", weight: 9 },
  { letter: "C", weight: 10 },
  { letter: "D", weight: 8 },
  { letter: "E", weight: 7 },
  { letter: "F", weight: 8 },
  { letter: "G", weight: 8 },
  { letter: "H", weight: 6 },
  { letter: "I", weight: 5 },
  { letter: "J", weight: 8 },
  { letter: "K", weight: 2 },
  { letter: "L", weight: 9 },
  { letter: "M", weight: 10 },
  { letter: "N", weight: 6 },
  { letter: "O", weight: 5 },
  { letter: "P", weight: 9 },
  { letter: "Q", weight: 2 },
  { letter: "R", weight: 9 },
  { letter: "S", weight: 9 },
  { letter: "T", weight: 8 },
  { letter: "U", weight: 3 },
  { letter: "V", weight: 7 },
  { letter: "W", weight: 2 },
  { letter: "X", weight: 1 },
  { letter: "Y", weight: 1 },
  { letter: "Z", weight: 4 },
];

const TOTAL_WEIGHT = LETTER_WEIGHTS.reduce((sum, l) => sum + l.weight, 0);

/** Sorteia uma letra A-Z respeitando os pesos. */
export function drawLetter(): string {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const { letter, weight } of LETTER_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return letter;
  }
  return "A";
}

export const ALL_LETTERS = LETTER_WEIGHTS.map((l) => l.letter);
