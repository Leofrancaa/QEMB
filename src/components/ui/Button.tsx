"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "sunny";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-magenta text-white shadow-[0_6px_0_0_#a21062] active:shadow-[0_2px_0_0_#a21062]",
  secondary:
    "bg-cyan text-ink shadow-[0_6px_0_0_#0e7490] active:shadow-[0_2px_0_0_#0e7490]",
  sunny:
    "bg-sunny text-ink shadow-[0_6px_0_0_#a16207] active:shadow-[0_2px_0_0_#a16207]",
  danger:
    "bg-tangerine text-white shadow-[0_6px_0_0_#9f1239] active:shadow-[0_2px_0_0_#9f1239]",
  ghost: "bg-white/10 text-white border border-white/20",
};

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: Props) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { y: 4, scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`select-none rounded-2xl px-6 py-4 text-lg font-extrabold tracking-wide transition-transform disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
