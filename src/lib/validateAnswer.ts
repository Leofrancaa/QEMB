// Validação dos 3 nomes escritos na fase de escrita (anti-trapaça).

import { MIN_NAME_LENGTH } from "./constants";
import { firstLetter, normalizeName, stripAccents } from "./text";

export type NameError = null | "empty" | "letter" | "short" | "duplicate";

export interface NameValidation {
  /** Erro do campo (null = válido). */
  error: NameError;
  valid: boolean;
}

/** Conta letras de fato (ignora espaços e pontuação). */
function letterCount(value: string): number {
  return stripAccents(value).replace(/[^a-zA-Z]/g, "").length;
}

/**
 * Valida um único nome contra a letra da rodada e contra os outros nomes.
 * `others` são os demais nomes digitados (para detectar duplicata).
 */
export function validateName(
  value: string,
  letter: string,
  others: string[],
): NameValidation {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { error: "empty", valid: false };
  }
  if (firstLetter(trimmed) !== letter.toUpperCase()) {
    return { error: "letter", valid: false };
  }
  if (trimmed.length < MIN_NAME_LENGTH || letterCount(trimmed) < 2) {
    return { error: "short", valid: false };
  }
  const norm = normalizeName(trimmed);
  if (others.some((o) => normalizeName(o) === norm)) {
    return { error: "duplicate", valid: false };
  }
  return { error: null, valid: true };
}

/** Valida os 3 nomes juntos; retorna o resultado de cada índice. */
export function validateAll(names: string[], letter: string): NameValidation[] {
  return names.map((name, i) => {
    const others = names.filter((_, j) => j !== i);
    return validateName(name, letter, others);
  });
}

/** True quando todos os nomes são válidos (libera o botão "Acabei!"). */
export function allValid(names: string[], letter: string): boolean {
  return validateAll(names, letter).every((v) => v.valid);
}

/** Mensagem amigável para um erro de campo. */
export function errorMessage(error: NameError, letter: string): string {
  switch (error) {
    case "empty":
      return "";
    case "letter":
      return `tem que começar com ${letter.toUpperCase()}!`;
    case "short":
      return "nome muito curtinho 🤨";
    case "duplicate":
      return "já escreveu esse!";
    default:
      return "";
  }
}
