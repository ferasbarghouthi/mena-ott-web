import type { Currency, Locale, Subscription } from "./api/types";

/** The subscription the account pages focus on: the newest one not cancelled (list is newest first). */
export const currentOf = (subs: Subscription[]) => subs.find((s) => s.status !== "CANCELLED");

const MINOR: Record<Currency, number> = { JOD: 1000, SAR: 100, AED: 100, USD: 100 };
const intlLocale = (l: Locale) => (l === "ar" ? "ar-JO-u-nu-latn" : "en-JO");

/** Formats a minor-unit amount; JOD shows three decimals (PRD v1.1 §5.1). */
export function formatMinor(amountMinor: number, currency: Currency, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency }).format(amountMinor / MINOR[currency]);
}

export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

export const daysUntil = (iso?: string) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)) : 0);
