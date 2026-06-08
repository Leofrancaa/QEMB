import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
