import { notFound } from "next/navigation";
import { PackageDetailView } from "@/components/views/package-detail";
import { api } from "@/lib/api/client";
import { DICTS, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return (await api.catalog.packages()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  const l = isLocale(locale) ? locale : "ar";
  const r = await api.catalog.package(slug);
  return pageMeta(locale, `/packages/${slug}`, r ? `${DICTS[l].pkg.title}: ${r.package.name[l]}` : undefined, r?.package.description[l]);
}

export default async function PackageDetailPage({ params }: P) {
  const { slug } = await params;
  const [r, categories, countries] = await Promise.all([api.catalog.package(slug), api.catalog.categories(), api.catalog.countries()]);
  if (!r) notFound();
  return <PackageDetailView pkg={r.package} channels={r.channels} categories={categories} countries={countries} />;
}
