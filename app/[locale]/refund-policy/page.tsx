import { LegalPage } from "@/components/legal";
import { REFUND } from "@/lib/content";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  return pageMeta(locale, "/refund-policy", DICTS[isLocale(locale) ? locale : "ar"].legal.refund);
}

export default async function RefundPolicyPage({ params }: LocaleParams) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "ar";
  return <LegalPage locale={l} title={DICTS[l].legal.refund} doc={REFUND} />;
}
