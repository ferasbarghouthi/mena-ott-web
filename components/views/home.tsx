"use client";

import { ChannelCard } from "@/components/channels";
import { useLocale } from "@/components/locale";
import { PackageGrid } from "@/components/packages";
import { Card, L, LinkButton } from "@/components/ui";
import { FAQ } from "@/lib/content";
import type { Category, Channel, Country, Package } from "@/lib/api/types";

const PLATFORMS = ["Android TV", "Google TV", "Samsung Tizen", "LG webOS", "Android", "iOS"];

export function HomeView({ packages, channels, categories, countries }: { packages: Package[]; channels: Channel[]; categories: Category[]; countries: Country[] }) {
  const { t, l, dir } = useLocale();
  const arrow = dir === "rtl" ? "←" : "→";
  return (
    <>
      <section className="hero-glow relative -mx-4 overflow-hidden px-4 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-fg sm:text-5xl">{t.home.heroTitle}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{t.home.heroSub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/packages" className="px-6 py-3 text-base">{t.home.ctaPackages}</LinkButton>
              <LinkButton href="/activate" variant="secondary" className="px-6 py-3 text-base">{t.home.ctaActivate}</LinkButton>
            </div>
          </div>
          <TvMock channels={channels} />
        </div>
      </section>

      <section className="py-14" aria-labelledby="how">
        <h2 id="how" className="text-center text-2xl font-bold text-fg sm:text-3xl">{t.home.stepsTitle}</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {t.home.steps.map(([title, body], i) => (
            <li key={title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-full bg-brand/15 text-lg font-bold text-brand">{i + 1}</span>
              <p className="mt-4 font-semibold text-fg">{title}</p>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-center text-sm text-muted">{t.home.stepsHint}</p>
      </section>

      <section className="py-14" aria-labelledby="pk">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="pk" className="text-2xl font-bold text-fg sm:text-3xl">{t.home.featured}</h2>
          <L href="/packages" className="text-sm font-semibold text-brand">{t.pkg.compare} {arrow}</L>
        </div>
        <PackageGrid packages={packages} />
      </section>

      <section className="py-14" aria-labelledby="chs">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="chs" className="text-2xl font-bold text-fg sm:text-3xl">{t.home.channelsTitle}</h2>
          <L href="/channels" className="text-sm font-semibold text-brand">{t.home.allChannels} {arrow}</L>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => <ChannelCard key={c.id} c={c} countries={countries} categories={categories} />)}
        </div>
      </section>

      <section className="py-14">
        <h2 className="mb-8 text-2xl font-bold text-fg sm:text-3xl">{t.home.whyTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.why.map(([title, body]) => (
            <Card key={title}>
              <h3 className="font-semibold text-fg">{title}</h3>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-14">
        <h2 className="mb-6 text-center text-2xl font-bold text-fg">{t.home.platformsTitle}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {PLATFORMS.map((p) => (
            <span key={p} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-fg" dir="ltr">{p}</span>
          ))}
        </div>
        <p className="mt-4 text-center"><L href="/setup" className="text-sm font-semibold text-brand">{t.nav.setup} {arrow}</L></p>
      </section>

      <section className="py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-fg">{t.home.faqTitle}</h2>
          <L href="/faq" className="text-sm font-semibold text-brand">{t.nav.faq} {arrow}</L>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.slice(0, 4).map((f) => (
            <Card key={f.q.en}>
              <h3 className="font-semibold text-fg">{l(f.q)}</h3>
              <p className="mt-2 text-sm text-muted">{l(f.a)}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

function TvMock({ channels }: { channels: Channel[] }) {
  const { t, l } = useLocale();
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden>
      <div className="rounded-[1.75rem] border border-line bg-black p-3 shadow-2xl shadow-brand/20">
        <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b1f45] to-[#0b0d17] p-5 text-white">
          <div className="flex h-full gap-4">
            <ul className="hidden w-1/2 space-y-2 sm:block">
              {channels.slice(0, 4).map((c, i) => (
                <li key={c.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${i === 0 ? "bg-white/15" : "bg-white/5"}`}>
                  <span className="grid size-6 place-items-center rounded bg-white/15 text-[10px] font-bold">{i + 1}</span>
                  <span className="truncate">{l(c.name)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-white/5 p-2 text-center">
              <span className="text-[11px] uppercase tracking-widest text-white/60">{t.activate.code}</span>
              <span className="mt-2 whitespace-nowrap font-mono text-xl font-bold tracking-[0.12em] sm:text-2xl" dir="ltr">A7K9-22XP</span>
              <span className="mt-2 text-[10px] text-white/50" dir="ltr">/activate</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-4 w-1/3 rounded-b-xl bg-line" />
    </div>
  );
}
