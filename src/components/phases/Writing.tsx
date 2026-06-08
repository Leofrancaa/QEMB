"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { ModifierCard } from "@/components/game/ModifierCard";
import { endWriting, submitAnswer } from "@/app/actions/round";
import { answerFor, finishedCount, connectedPlayers } from "@/lib/derive";
import { allValid, errorMessage, validateAll } from "@/lib/validateAnswer";
import { NAMES_PER_PLAYER, WRITING_SECONDS } from "@/lib/constants";
import type { UseRoom } from "@/hooks/useRoom";

export function Writing({ game }: { game: UseRoom }) {
  const { state, clientId, isHost, run } = game;
  const myAnswer = state ? answerFor(state, clientId) : undefined;
  const submitted = Boolean(myAnswer?.finishedAt);

  const [names, setNames] = useState<string[]>(
    () => myAnswer?.names?.length ? padNames(myAnswer.names) : ["", "", ""],
  );

  const letter = state?.round?.letter ?? "";
  const validations = useMemo(() => validateAll(names, letter), [names, letter]);
  const ready = allValid(names, letter);

  // se reentrar e já tem resposta, reflete
  useEffect(() => {
    if (myAnswer?.names?.length && !names.some((n) => n)) {
      setNames(padNames(myAnswer.names));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  function setName(i: number, value: string) {
    setNames((prev) => prev.map((n, j) => (j === i ? value : n)));
  }

  function finish() {
    if (!state) return;
    run(submitAnswer(state.code, clientId, names));
  }

  function handleExpire() {
    if (!state) return;
    if (!submitted) {
      // auto-envia o que tiver de válido
      const valid = names.filter((_, i) => validations[i].valid);
      run(submitAnswer(state.code, clientId, valid));
    }
    if (isHost) {
      // dá um respiro pros auto-envios dos outros caírem antes de fechar
      setTimeout(() => run(endWriting(state.code, clientId)), 1200);
    }
  }

  if (!state?.round) return null;

  if (submitted) {
    const done = finishedCount(state);
    const total = connectedPlayers(state).length;
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-stroke text-5xl text-lime"
        >
          ACABEI! ✍️
        </motion.div>
        <p className="text-lg font-bold text-white/70">
          Aguardando os outros... ({done}/{total})
        </p>
        {state.phaseEndsAt && (
          <div className="w-full">
            <Timer
              endsAt={state.phaseEndsAt}
              totalSeconds={WRITING_SECONDS}
              onExpire={isHost ? handleExpire : undefined}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
      {state.phaseEndsAt && (
        <Timer
          endsAt={state.phaseEndsAt}
          totalSeconds={WRITING_SECONDS}
          onExpire={handleExpire}
        />
      )}

      <div className="flex items-center justify-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sunny to-tangerine font-display text-5xl text-ink text-stroke">
          {letter}
        </div>
        <div className="flex-1">
          <ModifierCard
            modifier={state.round.modifier}
            pointValue={state.round.pointValue}
            compact
          />
        </div>
      </div>

      <p className="text-center font-bold text-white/70">
        3 famosos brabos com <span className="text-sunny">{letter}</span> 👇
      </p>

      <div className="flex flex-col gap-3">
        {names.map((value, i) => {
          const v = validations[i];
          const showError = value.trim().length > 0 && !v.valid;
          return (
            <div key={i}>
              <div
                className={`flex items-center gap-2 rounded-2xl bg-black/30 px-3 ring-2 transition-colors ${
                  showError
                    ? "ring-tangerine"
                    : v.valid
                      ? "ring-lime"
                      : "ring-white/10"
                }`}
              >
                <span className="font-display text-2xl text-white/40">{i + 1}</span>
                <input
                  value={value}
                  onChange={(e) => setName(i, e.target.value)}
                  maxLength={40}
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent py-3 text-lg font-bold outline-none"
                  placeholder={`famoso com ${letter}`}
                />
                {v.valid && <span className="text-lime">✓</span>}
              </div>
              {showError && (
                <p className="mt-1 pl-2 text-sm font-bold text-tangerine">
                  {errorMessage(v.error, letter)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button
        variant="sunny"
        className="w-full"
        disabled={!ready}
        onClick={finish}
      >
        {ready ? "ACABEI! 🏁" : `Preencha os ${NAMES_PER_PLAYER} 👀`}
      </Button>
    </div>
  );
}

function padNames(names: string[]): string[] {
  const out = [...names];
  while (out.length < NAMES_PER_PLAYER) out.push("");
  return out.slice(0, NAMES_PER_PLAYER);
}
