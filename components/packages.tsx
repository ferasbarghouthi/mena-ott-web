"use client";

import type { Package } from "@/lib/api/types";
import type { Dict } from "@/lib/i18n";
import { useLocale } from "./locale";
import { cx, L, LinkButton } from "./ui";

export function durationLabel(days: number, t: Dict) {
  if (days === 30) return `1 ${t.pkg.month}`;
  if (days === 365) return `1 ${t.pkg.year}`;
  return `${days} ${t.pkg.days}`;
}

const Check = () => (
  <svg viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-brand" fill="currentColor" aria-hidden>
    <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" />
  </svg>
);

export function packageLines(p: Package, t: Dict, l: (v: Package["name"]) => string) {
  return [
    `${p.channelCount}+ ${t.pkg.channels}`,
    `${p.maxDevices} ${p.maxDevices === 1 ? t.pkg.device : t.pkg.devices} · ${p.maxStreams} ${t.pkg.streams}`,
    p.vod ? t.pkg.vod : t.pkg.noVod,
    `${t.pkg.quality} ${p.quality}`,
    ...p.features.map(l),
  ];
}

export function PackageCard({ p }: { p: Package }) {
  const { t, l, price } = useLocale();
  return (
    <div
      className={cx(
        "relative flex flex-col rounded-3xl border bg-surface p-6",
        p.featured ? "border-brand shadow-xl shadow-brand/15 ring-1 ring-brand" : "border-line",
      )}
    >
      {p.featured && (
        <span className="absolute -top-3 start-6 rounded-full bg-gradient-to-r from-brand to-accent px-3 py-1 text-xs font-bold text-white">{t.pkg.popular}</span>
      )}
      <h3 className="text-xl font-bold text-fg">{l(p.name)}</h3>
      <p className="mt-1 text-sm text-muted">{l(p.description)}</p>
      <div className="mt-5">
        <span className="text-3xl font-extrabold tracking-tight text-fg">{price(p.price)}</span>
        <span className="ms-2 text-sm text-muted">/ {durationLabel(p.durationDays, t)}</span>
        <p className="mt-1 text-xs text-muted">{t.pkg.taxIncl}</p>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-fg/90">
        {packageLines(p, t, l).map((x) => (
          <li key={x} className="flex gap-2">
            <Check />
            {x}
          </li>
        ))}
      </ul>
      <LinkButton href={`/checkout?package=${p.slug}`} variant={p.featured ? "primary" : "secondary"} className="mt-6 w-full py-3">
        {t.pkg.subscribe}
      </LinkButton>
      <L href={`/packages/${p.slug}`} className="mt-3 text-center text-sm font-medium text-muted hover:text-fg">
        {t.pkg.details}
      </L>
    </div>
  );
}

export function PackageGrid({ packages }: { packages: Package[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages.map((p) => (
        <PackageCard key={p.slug} p={p} />
      ))}
    </div>
  );
}

export function CompareTable({ packages }: { packages: Package[] }) {
  const { t, l, price } = useLocale();
  const rows: [string, (p: Package) => string][] = [
    [t.pkg.price, (p) => price(p.price)],
    [t.pkg.duration, (p) => durationLabel(p.durationDays, t)],
    [t.ch.title, (p) => `${p.channelCount}+`],
    [t.pkg.devices, (p) => String(p.maxDevices)],
    [t.pkg.streams, (p) => String(p.maxStreams)],
    [t.pkg.vod, (p) => (p.vod ? "✓" : "—")],
    [t.pkg.quality, (p) => p.quality],
    [t.pkg.deviceSwaps, (p) => String(p.maxDeviceSwaps)],
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-surface-2 text-fg">
          <tr>
            <th className="p-4 text-start font-semibold"><span className="sr-only">{t.pkg.compare}</span></th>
            {packages.map((p) => (
              <th key={p.slug} scope="col" className="p-4 text-start font-semibold">{l(p.name)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, fn]) => (
            <tr key={label} className="border-t border-line">
              <th scope="row" className="p-4 text-start font-normal text-muted">{label}</th>
              {packages.map((p) => (
                <td key={p.slug} className="p-4 font-medium text-fg">{fn(p)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
