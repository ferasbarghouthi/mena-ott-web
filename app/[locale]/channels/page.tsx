import { ChannelBrowser } from "@/components/channels";
import { PageHeaderServer } from "@/components/server-ui";
import { api } from "@/lib/api/client";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const t = DICTS[isLocale(locale) ? locale : "ar"];
  return pageMeta(locale, "/channels", t.ch.title, t.ch.sub);
}

export default async function ChannelsPage({ params }: LocaleParams) {
  const { locale } = await params;
  const t = DICTS[isLocale(locale) ? locale : "ar"];
  const [channels, categories, countries, packages] = await Promise.all([
    api.catalog.channels(),
    api.catalog.categories(),
    api.catalog.countries(),
    api.catalog.packages(),
  ]);
  return (
    <div className="py-12">
      <PageHeaderServer title={t.ch.title} sub={t.ch.sub} />
      <ChannelBrowser channels={channels} categories={categories} countries={countries} packages={packages} />
    </div>
  );
}
