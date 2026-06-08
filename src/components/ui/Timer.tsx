"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  endsAt: number;
  totalSeconds: number;
  onExpire?: () => void;
}

export function Timer({ endsAt, totalSeconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)),
  );
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const tick = () => {
      const secs = Math.max(0, (endsAt - Date.now()) / 1000);
      setRemaining(Math.ceil(secs));
      if (secs <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  const pct = Math.max(0, Math.min(100, (remaining / totalSeconds) * 100));
  const urgent = remaining <= 5;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-end justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-white/60">
          Tempo
        </span>
        <span
          className={`font-display text-4xl leading-none text-stroke ${
            urgent ? "animate-pulse text-tangerine" : "text-sunny"
          }`}
        >
          {remaining}s
        </span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-black/30">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ease-linear ${
            urgent ? "bg-tangerine" : "bg-lime"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
