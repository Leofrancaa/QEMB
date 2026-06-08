// Gerador de apelido + emoji aleatório engraçado para entrar na sala.

const ADJETIVOS = [
  "Brabo", "Lendário", "Insano", "Supremo", "Caótico", "Místico", "Turbinado",
  "Avassalador", "Fominha", "Tranquilão", "Raiz", "Top", "Cabuloso", "Monstro",
  "Imortal", "Marombeiro", "Filosófico", "Sinistro", "Galáctico", "Implacável",
];

const SUBSTANTIVOS = [
  "Capivara", "Jacaré", "Polvo", "Dragão", "Tatu", "Gambá", "Pinguim", "Lhama",
  "Coruja", "Tubarão", "Camaleão", "Ornitorrinco", "Bisão", "Furão", "Quati",
  "Onça", "Texugo", "Mandril", "Narval", "Águia",
];

export const PLAYER_EMOJIS = [
  "🔥", "👑", "🦅", "🐉", "💀", "🤠", "🦁", "🐊", "🦈", "🐙",
  "🦖", "🐺", "🦍", "🦨", "🐯", "🦛", "🐲", "🦂", "🦦", "🐗",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomNickname(): string {
  return `${pick(SUBSTANTIVOS)} ${pick(ADJETIVOS)}`;
}

export function randomEmoji(): string {
  return pick(PLAYER_EMOJIS);
}
