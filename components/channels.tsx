"use client";

import { useMemo, useState } from "react";
import type { Category, Channel, Country, Package } from "@/lib/api/types";
import { useLocale } from "./locale";
import { cx, Input, Select } from "./ui";

export function ChannelLogo({ c }: { c: Channel }) {
  const hue = (parseInt(c.id.replace(/\D/g, "") || "1") * 47) % 360;
  return (
    <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: `oklch(0.55 0.15 ${hue})` }}>
      {c.name.en.split(" ").map((w) => w[0]).join("").slice(0, 3)}
    </span>
  );
}

export function ChannelCard({ c, countries, categories, packages }: { c: Channel; countries: Country[]; categories: Category[]; packages?: Package[] }) {
  const { t, l, locale } = useLocale();
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <ChannelLogo c={c} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-fg">{l(c.name)}</h3>
          <p className="text-xs text-muted">
            {l(countries.find((x) => x.id === c.country)?.name ?? { ar: c.country, en: c.country })} · {l(categories.find((x) => x.id === c.category)?.name ?? { ar: c.category, en: c.category })}
          </p>
        </div>
      </div>
      {c.now && (
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="rounded bg-red-500/15 px-1.5 text-xs font-bold leading-5 text-red-500">{t.ch.now}</dt>
            <dd className="truncate text-fg">
              {l(c.now.title)} <span className="text-muted" dir="ltr">{c.now.start}–{c.now.end}</span>
            </dd>
          </div>
          {c.next && (
            <div className="flex gap-2">
              <dt className="rounded bg-surface-2 px-1.5 text-xs font-bold leading-5 text-muted">{t.ch.next}</dt>
              <dd className="truncate text-muted">{l(c.next.title)}</dd>
            </div>
          )}
        </dl>
      )}
      {packages && (
        <p className="mt-3 text-xs text-muted">
          {t.ch.includedIn}: {packages.filter((p) => c.packages.includes(p.slug)).map((p) => l(p.name)).join(locale === "ar" ? "، " : ", ")}
        </p>
      )}
    </article>
  );
}

export function ChannelBrowser({ channels, categories, countries, packages }: { channels: Channel[]; categories: Category[]; countries: Country[]; packages?: Package[] }) {
  const { t, l } = useLocale();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return channels.filter(
      (c) =>
        (!country || c.country === country) &&
        (!category || c.category === category) &&
        (!language || c.language === language) &&
        (!needle || `${c.name.ar} ${c.name.en}`.toLowerCase().includes(needle)),
    );
  }, [channels, q, country, category, language]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input type="search" placeholder={t.ch.search} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.ch.search} />
        <Select value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t.ch.country}>
          <option value="">{t.ch.country}: {t.ch.all}</option>
          {countries
            .filter((c) => c.channelCount !== 0)
            .map((c) => <option key={c.id} value={c.id}>{l(c.name)}{c.channelCount ? ` (${c.channelCount})` : ""}</option>)}
        </Select>
        <Select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label={t.ch.language}>
          <option value="">{t.ch.language}: {t.ch.all}</option>
          <option value="ar">{t.ch.langAr}</option>
          <option value="en">{t.ch.langEn}</option>
        </Select>
        <p className="self-center text-sm text-muted" aria-live="polite">{list.length} {t.ch.count}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t.ch.category}>
        {[{ id: "", name: { ar: t.ch.all, en: t.ch.all } }, ...categories].map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
            className={cx("rounded-full border px-3.5 py-1.5 text-sm transition", category === c.id ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted hover:text-fg")}
          >
            {l(c.name)}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-10 text-center text-muted">{t.ch.empty}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => <ChannelCard key={c.id} c={c} countries={countries} categories={categories} packages={packages} />)}
        </div>
      )}
    </>
  );
}
