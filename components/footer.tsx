"use client";

import { BRAND } from "@/lib/i18n";
import { USING_MOCK } from "@/lib/api/client";
import { Logo } from "./header";
import { useLocale } from "./locale";
import { L } from "./ui";

export function Footer() {
  const { t, locale } = useLocale();
  const cols = [
    [t.footer.company, [["/packages", t.nav.packages], ["/channels", t.nav.channels], ["/setup", t.nav.setup]]],
    [t.footer.help, [["/faq", t.nav.faq], ["/support", t.nav.support], ["/activate", t.nav.activate], ["/account", t.nav.account]]],
    [t.footer.legal, [["/terms", t.legal.terms], ["/privacy", t.legal.privacy], ["/refund-policy", t.legal.refund]]],
  ] as const;
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{t.footer.tagline}</p>
          {USING_MOCK && <p className="text-xs text-amber-600 dark:text-amber-400">{t.footer.mock}</p>}
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
            <ul className="space-y-2">
              {links.map(([href, label]) => (
                <li key={href}>
                  <L href={href} className="text-sm text-muted hover:text-fg">{label}</L>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © 2026 {BRAND[locale]}. {t.footer.rights}.
      </div>
    </footer>
  );
}
