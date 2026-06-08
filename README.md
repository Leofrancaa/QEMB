# Quem é Mais Brabo 🔥

Jogo de festa multiplayer (mobile-first / PWA): a cada rodada sorteia-se uma letra,
cada jogador escreve **3 famosos brabos** com aquela letra, revela **1** deles (sem
repetir o que já foi revelado) e todos votam em **quem é o mais brabo**. Quem leva mais
votos pontua. Tem modificadores aleatórios pra zoeira ("não vale jogador de futebol",
"só vale mulher", "rodada dobrada", etc.).

- **3 a 10 jogadores** por sala • host escolhe até **10 rodadas**
- Tempo real via **Supabase Realtime** • placar persistido com **Drizzle + Postgres**
- **Next.js + TypeScript + Tailwind v4 + Framer Motion** • deploy no **Vercel**

## Como funciona uma rodada

1. **Sorteio** da letra (caça-níquel) + carta de modificador.
2. **Escrita (30s):** cada um digita 3 nomes válidos (precisam começar com a letra —
   o input fica vermelho se não começar). Ao terminar, aperta **"Acabei!"** e entra na fila.
3. **Revelação (em ordem de quem terminou):** cada jogador revela 1 dos seus 3 nomes,
   sem repetir nomes já revelados. Dá pra **contestar** nomes suspeitos (💀).
4. **Votação:** todos votam no mais brabo (não pode votar em si mesmo).
5. **Resultado:** quem teve mais votos ganha ponto(s). Empate pontua todos no topo.

## Setup

### 1. Dependências
```bash
npm install
```

### 2. Supabase
1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API)
   - `DATABASE_URL` (Settings → Database → Connection string → **pooler**, porta 6543)
3. Crie as tabelas (uma das opções):
   - `npm run db:push` (aplica o schema direto), **ou**
   - cole o conteúdo de `drizzle/0000_init.sql` no **SQL Editor** do Supabase.

> O Realtime (broadcast/presence) não exige nenhuma configuração extra de tabelas.

### 3. Rodar local
```bash
npm run dev
```
Abra http://localhost:3000 em 3 abas/dispositivos pra testar uma partida.

> Em dev o service worker (PWA) fica desativado. Para testar o PWA, use `npm run build && npm start`.

## Deploy (Vercel)
1. Importe o repositório na Vercel.
2. Configure as 3 variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`).
3. Deploy. O build roda `next build --webpack` (necessário para o Serwist/PWA).

## Scripts
| Script | O que faz |
|---|---|
| `npm run dev` | Dev server (Turbopack, SW desativado) |
| `npm run build` | Build de produção (webpack + service worker) |
| `npm run db:push` | Aplica o schema Drizzle no Postgres |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run icons` | Regenera os ícones do PWA a partir dos SVGs em `scripts/` |

## Logo
A logo provisória é vetorial (`scripts/icon.svg`). Veja **`LOGO_PROMPT.md`** para um prompt
pronto de gerar uma logo oficial numa IA de imagem.

## Stack / Arquitetura
- **Host-autoritativo:** o client do host controla a máquina de estados e dispara as
  transições por tempo (ex.: fim dos 30s). Toda ação grava no Postgres via *server
  actions* e o novo estado é propagado por **broadcast**; os clients aplicam o snapshot.
- Reconexão: ao reabrir, o estado é relido do banco (`getRoomState`).
- Identidade sem login: um `clientId` por navegador (localStorage).
