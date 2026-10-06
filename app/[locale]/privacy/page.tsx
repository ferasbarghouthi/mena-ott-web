import { LegalPage } from "@/components/legal";
import { PRIVACY } from "@/lib/content";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  return pageMeta(locale, "/privacy", DICTS[isLocale(locale) ? locale : "ar"].legal.privacy);
}

export default async function PrivacyPage({ params }: LocaleParams) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "ar";
  return <LegalPage locale={l} title={DICTS[l].legal.privacy} doc={PRIVACY} />;
}
