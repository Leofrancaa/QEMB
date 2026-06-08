// Utilidades de texto compartilhadas (normalização de nomes/acentos)

const COMBINING_MARKS = /[̀-ͯ]/g;

/** Remove acentos: "José" -> "jose". */
export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(COMBINING_MARKS, "");
}

/** Normaliza para comparação: sem acento, minúsculo, espaços colapsados. */
export function normalizeName(value: string): string {
  return stripAccents(value.trim().toLowerCase()).replace(/\s+/g, " ");
}

/** Verifica se duas entradas representam o mesmo nome. */
export function sameName(a: string, b: string): boolean {
  return normalizeName(a) === normalizeName(b);
}

/** Primeira letra "limpa" (sem acento, maiúscula). */
export function firstLetter(value: string): string {
  const clean = stripAccents(value.trim());
  return clean.charAt(0).toUpperCase();
}
