import { CompareTable, PackageGrid } from "@/components/packages";
import { PageHeaderServer } from "@/components/server-ui";
import { api } from "@/lib/api/client";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  const t = DICTS[isLocale(locale) ? locale : "ar"];
  return pageMeta(locale, "/packages", t.pkg.title, t.pkg.sub);
}

export default async function PackagesPage({ params }: LocaleParams) {
  const { locale } = await params;
  const t = DICTS[isLocale(locale) ? locale : "ar"];
  const packages = await api.catalog.packages();
  return (
    <div className="py-12">
      <PageHeaderServer title={t.pkg.title} sub={t.pkg.sub} />
      <PackageGrid packages={packages} />
      <h2 className="mb-4 mt-16 text-2xl font-bold text-fg">{t.pkg.compare}</h2>
      <CompareTable packages={packages} />
    </div>
  );
}
