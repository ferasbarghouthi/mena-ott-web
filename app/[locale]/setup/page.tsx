import Link from "next/link";
import { PageHeaderServer } from "@/components/server-ui";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const t = DICTS[isLocale(locale) ? locale : "ar"];
  return pageMeta(locale, "/setup", t.setup.title, t.setup.sub);
}

export default async function SetupPage({ params }: LocaleParams) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "ar";
  const t = DICTS[l];
  return (
    <div className="mx-auto max-w-4xl py-12">
      <PageHeaderServer title={t.setup.title} sub={t.setup.sub} />
      <h2 className="mb-4 text-xl font-bold text-fg">{t.setup.install}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {t.setup.platforms.map(([name, body]) => (
          <div key={name} className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-semibold text-fg" dir="ltr">{name}</h3>
            <p className="mt-1 text-sm text-muted">{body}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">{t.setup.drm}</p>

      <h2 className="mb-4 mt-12 text-xl font-bold text-fg">{t.setup.pairTitle}</h2>
      <ol className="space-y-3">
        {t.setup.pairSteps.map((s, i) => (
          <li key={s} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/15 font-bold text-brand">{i + 1}</span>
            <p className="text-fg">{s}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">{t.setup.codeNote}</p>
      <Link href={`/${l}/activate`} className="mt-8 inline-flex rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-600">
        {t.setup.cta}
      </Link>
    </div>
  );
}
