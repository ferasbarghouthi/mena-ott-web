"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { L10n, Locale, Price } from "@/lib/api/types";
import { DICTS, type Dict } from "@/lib/i18n";
import { formatDate, formatMinor } from "@/lib/format";

type Ctx = {
  locale: Locale;
  t: Dict;
  dir: "rtl" | "ltr";
  href: (path: string) => string;
  l: (v: L10n) => string;
  price: (p: Pick<Price, "amountMinor" | "currency">) => string;
  date: (iso: string) => string;
};
const LocaleCtx = createContext<Ctx | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value: Ctx = {
    locale,
    t: DICTS[locale],
    dir: locale === "ar" ? "rtl" : "ltr",
    href: (path) => `/${locale}${path === "/" ? "" : path}`,
    l: (v) => v[locale],
    price: (p) => formatMinor(p.amountMinor, p.currency, locale),
    date: (iso) => formatDate(iso, locale),
  };
  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const c = useContext(LocaleCtx);
  if (!c) throw new Error("useLocale outside LocaleProvider");
  return c;
}
