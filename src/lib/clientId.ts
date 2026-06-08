// Identidade persistente do jogador (sem login) via localStorage.

const KEY = "qemb_client_id";

/** Retorna (ou cria) o ID público do jogador para este navegador. */
export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
