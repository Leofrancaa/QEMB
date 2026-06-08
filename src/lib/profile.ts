// Perfil local do jogador (apelido + emoji) salvo no navegador.

import { randomEmoji, randomNickname } from "./names";

const KEY = "qemb_profile";

export interface Profile {
  nickname: string;
  emoji: string;
}

export function getProfile(): Profile {
  if (typeof window === "undefined") return { nickname: "", emoji: "🔥" };
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Profile;
    } catch {
      // ignora json inválido
    }
  }
  const fresh = { nickname: randomNickname(), emoji: randomEmoji() };
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}
