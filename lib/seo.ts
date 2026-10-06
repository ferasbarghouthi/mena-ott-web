import type { Metadata } from "next";
import type { Locale } from "./api/types";
import { BRAND, DICTS, isLocale } from "./i18n";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Title, description and hreflang alternates for a localized page. */
export function pageMeta(locale: string, path: string, title?: string, description?: string): Metadata {
  const l: Locale = isLocale(locale) ? locale : "ar";
  return {
    metadataBase: new URL(SITE),
    title: title ? `${title} | ${BRAND[l]}` : BRAND[l],
    description: description ?? DICTS[l].home.heroSub,
    alternates: {
      canonical: `/${l}${path}`,
      languages: { ar: `/ar${path}`, en: `/en${path}`, "x-default": `/ar${path}` },
    },
  };
}

export type LocaleParams = { params: Promise<{ locale: string }> };
