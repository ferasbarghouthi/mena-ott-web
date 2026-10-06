"use client";

import { useEffect } from "react";
import { ChannelLogo } from "@/components/channels";
import { useLocale } from "@/components/locale";
import { durationLabel, packageLines } from "@/components/packages";
import { Card, L, LinkButton } from "@/components/ui";
import { track } from "@/lib/analytics";
import type { Category, Channel, Country, Package } from "@/lib/api/types";

export function PackageDetailView({ pkg, channels, categories, countries }: { pkg: Package; channels: Channel[]; categories: Category[]; countries: Country[] }) {
  const { t, l, price, dir } = useLocale();
  useEffect(() => track("view_package", { package: pkg.slug }), [pkg.slug]);

  const byCategory = categories
    .map((cat) => ({ cat, items: channels.filter((c) => c.category === cat.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="py-12">
      <L href="/packages" className="text-sm text-muted hover:text-fg">{dir === "rtl" ? "→" : "←"} {t.pkg.back}</L>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <h1 className="text-3xl font-bold text-fg sm:text-4xl">{l(pkg.name)}</h1>
          <p className="mt-2 text-muted">{l(pkg.description)}</p>
          <h2 className="mb-4 mt-10 text-xl font-bold text-fg">{t.pkg.channelsIn} ({channels.length})</h2>
          <div className="space-y-6">
            {byCategory.map(({ cat, items }) => (
              <section key={cat.id}>
                <h3 className="mb-2 text-sm font-semibold text-muted">{l(cat.name)}</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {items.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">
                      <ChannelLogo c={c} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-fg">{l(c.name)}</p>
                        <p className="text-xs text-muted">{l(countries.find((x) => x.id === c.country)?.name ?? { ar: "", en: "" })}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <aside>
          <Card className="lg:sticky lg:top-24">
            <p className="text-3xl font-extrabold text-fg">{price(pkg.price)}</p>
            <p className="text-sm text-muted">/ {durationLabel(pkg.durationDays, t)} · {t.pkg.taxIncl}</p>
            <ul className="mt-5 space-y-2 text-sm text-fg">
              {packageLines(pkg, t, l).map((x) => <li key={x}>✓ {x}</li>)}
              <li>✓ {t.pkg.deviceSwaps}: {pkg.maxDeviceSwaps}</li>
            </ul>
            <LinkButton href={`/checkout?package=${pkg.slug}`} className="mt-6 w-full py-3">{t.pkg.subscribe}</LinkButton>
          </Card>
        </aside>
      </div>
    </div>
  );
}
