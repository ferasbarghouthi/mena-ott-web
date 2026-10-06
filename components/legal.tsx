import type { Locale } from "@/lib/api/types";
import type { LegalDoc } from "@/lib/content";
import { DICTS } from "@/lib/i18n";
import { PageHeaderServer } from "./server-ui";

export function LegalPage({ locale, title, doc }: { locale: Locale; title: string; doc: LegalDoc }) {
  const t = DICTS[locale];
  return (
    <div className="mx-auto max-w-3xl py-12">
      <PageHeaderServer title={title} sub={`${t.legal.version} ${doc.version} · ${t.legal.updated}: ${doc.updated}`} />
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">{t.legal.draft}</div>
      <div className="mt-8 space-y-8">
        {doc.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-bold text-fg">{i + 1}. {s.h[locale]}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.p[locale]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
