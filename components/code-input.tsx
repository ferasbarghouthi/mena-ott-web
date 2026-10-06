"use client";

import { Input } from "./ui";

// Pairing codes use A-Z and 2-9 without the look-alikes 0/O and 1/I (PRD v1.1 §7).
export const PAIRING_RE = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

export function normalizeCode(v: string) {
  const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
}

export function CodeInput({ value, onChange, id, autoFocus }: { value: string; onChange: (v: string) => void; id?: string; autoFocus?: boolean }) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(normalizeCode(e.target.value))}
      dir="ltr"
      placeholder="XXXX-XXXX"
      autoCapitalize="characters"
      autoComplete="one-time-code"
      spellCheck={false}
      autoFocus={autoFocus}
      inputMode="text"
      className="text-center font-mono text-2xl tracking-[0.25em]"
    />
  );
}
