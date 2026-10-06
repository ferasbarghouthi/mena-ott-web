import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { PageHeaderServer } from "@/components/server-ui";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  return pageMeta(locale, "/faq", DICTS[isLocale(locale) ? locale : "ar"].faq.title);
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "ar";
  const t = DICTS[l];
  return (
    <div className="mx-auto max-w-3xl py-12">
      <PageHeaderServer title={t.faq.title} />
      <FaqList />
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6">
        <p className="font-semibold text-fg">{t.faq.more}</p>
        <Link href={`/${l}/support`} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">{t.faq.contact}</Link>
      </div>
    </div>
  );
}
