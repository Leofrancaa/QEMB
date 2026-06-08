"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createRoom } from "@/app/actions/room";
import { getClientId } from "@/lib/clientId";
import { getProfile, saveProfile } from "@/lib/profile";
import { randomEmoji, randomNickname, PLAYER_EMOJIS } from "@/lib/names";
import { DEFAULT_ROUNDS, MAX_ROUNDS } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [emoji, setEmoji] = useState("🔥");
  const [rounds, setRounds] = useState(DEFAULT_ROUNDS);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = getProfile();
    setNickname(p.nickname);
    setEmoji(p.emoji);
  }, []);

  const persist = () =>
    saveProfile({ nickname: nickname.trim() || randomNickname(), emoji });

  async function handleCreate() {
    setBusy(true);
    setError(null);
    persist();
    const result = await createRoom({
      clientId: getClientId(),
      nickname: nickname.trim() || randomNickname(),
      emoji,
      totalRounds: rounds,
    });
    if (result.ok && result.code) {
      router.push(`/room/${result.code}`);
    } else {
      setError(result.ok ? "Erro ao criar sala." : result.error);
      setBusy(false);
    }
  }

  function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      setError("Digite o código da sala.");
      return;
    }
    persist();
    router.push(`/room/${code}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-8">
      <div className="mt-2">
        <Wordmark />
        <p className="mt-3 text-center font-semibold text-white/70">
          Sorteia uma letra. Quem citar o famoso mais brabo, leva. 😎
        </p>
      </div>

      {/* Perfil */}
      <Card>
        <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-white/60">
          Seu apelido
        </label>
        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            className="min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-3 text-lg font-bold outline-none ring-2 ring-white/10 focus:ring-cyan"
            placeholder="Seu nome brabo"
          />
          <button
            onClick={() => {
              setNickname(randomNickname());
              setEmoji(randomEmoji());
            }}
            className="rounded-xl bg-white/10 px-4 text-2xl"
            title="Aleatório"
          >
            🎲
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PLAYER_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`rounded-xl px-2 py-1 text-2xl transition-transform active:scale-90 ${
                emoji === e ? "bg-cyan/30 ring-2 ring-cyan" : "bg-white/5"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </Card>

      {/* Criar */}
      <Card>
        <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-white/60">
          Rodadas: <span className="text-sunny">{rounds}</span>
        </label>
        <input
          type="range"
          min={1}
          max={MAX_ROUNDS}
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          className="w-full accent-magenta"
        />
        <Button
          variant="primary"
          className="mt-3 w-full"
          disabled={busy}
          onClick={handleCreate}
        >
          {busy ? "Criando..." : "Criar sala 🎉"}
        </Button>
      </Card>

      {/* Entrar */}
      <Card>
        <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-white/60">
          Entrar com código
        </label>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-3 text-center text-2xl font-black tracking-[0.3em] outline-none ring-2 ring-white/10 focus:ring-cyan"
            placeholder="ABC123"
          />
          <Button variant="secondary" onClick={handleJoin}>
            Entrar
          </Button>
        </div>
      </Card>

      {error && <p className="text-center font-bold text-tangerine">{error}</p>}

      <p className="mt-auto pt-4 text-center text-xs text-white/40">
        3 a 10 jogadores • melhor no celular 📱
      </p>
    </main>
  );
}
