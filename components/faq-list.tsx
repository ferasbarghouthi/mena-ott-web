"use client";

import { useState } from "react";
import { FAQ } from "@/lib/content";
import { useLocale } from "./locale";
import { Input } from "./ui";

export function FaqList({ limit }: { limit?: number }) {
  const { t, l } = useLocale();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const items = FAQ.filter((f) => !needle || `${l(f.q)} ${l(f.a)}`.toLowerCase().includes(needle)).slice(0, limit);
  return (
    <div>
      <Input type="search" placeholder={t.faq.search} aria-label={t.faq.search} value={q} onChange={(e) => setQ(e.target.value)} className="mb-4" />
      {items.length === 0 ? (
        <p className="py-6 text-center text-muted">{t.faq.none}</p>
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {items.map((f, i) => (
            <details key={f.q.en} className="group p-5" open={i === 0 && !needle}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-fg">
                {l(f.q)}
                <span className="text-xl text-muted transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{l(f.a)}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
