"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { useMe } from "@/lib/api/hooks";
import { BRAND } from "@/lib/i18n";
import { useLocale } from "./locale";
import { cx, L, LinkButton } from "./ui";

export function Logo() {
  const { locale } = useLocale();
  return (
    <L href="/" className="flex items-center gap-2 text-lg font-extrabold text-fg">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-accent text-white shadow">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M8 21h8M10 9l4 2-4 2z" fill="currentColor" />
        </svg>
      </span>
      {BRAND[locale]}
    </L>
  );
}

export function Header() {
  const { t, locale, href } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);

  const other = locale === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);

  const nav = [
    ["/packages", t.nav.packages],
    ["/channels", t.nav.channels],
    ["/setup", t.nav.setup],
    ["/faq", t.nav.faq],
    ["/support", t.nav.support],
  ] as const;
  const isActive = (p: string) => pathname.startsWith(href(p));
  const logout = async () => {
    await api.auth.logout();
    router.push(href("/"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map(([p, label]) => (
            <L key={p} href={p} className={cx("rounded-lg px-3 py-2 text-sm font-medium transition hover:text-fg", isActive(p) ? "text-fg" : "text-muted")}>
              {label}
            </L>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1.5">
          <L href="/activate" className="hidden rounded-lg px-2.5 py-2 text-sm font-semibold text-brand hover:bg-surface-2 sm:block">
            {t.nav.activate}
          </L>
          <Link href={switchHref} hrefLang={other} lang={other} className="rounded-lg px-2.5 py-2 text-sm font-medium text-muted hover:text-fg">
            {t.nav.switchLang}
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            {me ? (
              <>
                <LinkButton href="/account" variant="secondary">{t.nav.account}</LinkButton>
                <button className="rounded-lg px-2.5 py-2 text-sm text-muted hover:text-fg" onClick={logout}>{t.nav.logout}</button>
              </>
            ) : (
              <>
                <LinkButton href="/login" variant="ghost">{t.nav.login}</LinkButton>
                <LinkButton href="/register">{t.nav.register}</LinkButton>
              </>
            )}
          </div>
          <button className="rounded-lg p-2 text-fg lg:hidden" aria-label={t.nav.menu} aria-expanded={open} onClick={() => setOpen(!open)}>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line px-4 py-3 lg:hidden" onClick={() => setOpen(false)}>
          <nav className="flex flex-col gap-1">
            <L href="/activate" className="rounded-lg px-3 py-2.5 font-semibold text-brand hover:bg-surface-2">{t.nav.activate}</L>
            {nav.map(([p, label]) => (
              <L key={p} href={p} className="rounded-lg px-3 py-2.5 text-fg hover:bg-surface-2">{label}</L>
            ))}
            {me ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <LinkButton href="/account">{t.nav.account}</LinkButton>
                <button className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted" onClick={logout}>{t.nav.logout}</button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <LinkButton href="/login" variant="secondary">{t.nav.login}</LinkButton>
                <LinkButton href="/register">{t.nav.register}</LinkButton>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
