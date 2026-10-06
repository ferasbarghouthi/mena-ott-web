import { LegalPage } from "@/components/legal";
import { TERMS } from "@/lib/content";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  return pageMeta(locale, "/terms", DICTS[isLocale(locale) ? locale : "ar"].legal.terms);
}

export default async function TermsPage({ params }: LocaleParams) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "ar";
  return <LegalPage locale={l} title={DICTS[l].legal.terms} doc={TERMS} />;
}
