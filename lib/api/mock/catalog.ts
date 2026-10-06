// Mock of the Package, Pricing and Content services behind the public
// catalog endpoints. Placeholder values only: real prices come from the
// Pricing Engine and real channels from the provider's licensed catalogue.

import type { Category, Channel, Country, Currency, L10n, Package, Price } from "../types";

type Market = { id: string; currency: Currency; taxRate: number };
export const MARKETS: Record<string, Market> = {
  JO: { id: "JO", currency: "JOD", taxRate: 0.16 }, // MVP market; tax rate is a placeholder
};

// (package, market) -> tax-inclusive price in minor units.
const PRICE_BOOK: Record<string, Record<string, number>> = {
  basic: { JO: 5000 },
  premium: { JO: 45000 },
  family: { JO: 70000 },
};

export function priceFor(slug: string, market: string): Price {
  const m = MARKETS[market] ?? MARKETS.JO;
  const amountMinor = PRICE_BOOK[slug]?.[m.id] ?? 0;
  return { amountMinor, taxMinor: Math.round(amountMinor - amountMinor / (1 + m.taxRate)), taxRate: m.taxRate, currency: m.currency };
}

type PackageDef = Omit<Package, "price">;
const PACKAGES: PackageDef[] = [
  {
    slug: "basic",
    name: { ar: "الأساسية", en: "Basic" },
    description: { ar: "قنوات المنطقة لمدة شهر", en: "Regional channels for a month" },
    durationDays: 30,
    maxDevices: 1,
    maxStreams: 1,
    maxDeviceSwaps: 1,
    channelCount: 120,
    quality: "HD",
    vod: false,
    featured: false,
    features: [
      { ar: "قنوات MENA الأساسية", en: "Core MENA channels" },
      { ar: "دليل البرامج", en: "Program guide" },
    ],
  },
  {
    slug: "premium",
    name: { ar: "بريميوم", en: "Premium" },
    description: { ar: "الباقة الموسعة لسنة كاملة", en: "The expanded package for a full year" },
    durationDays: 365,
    maxDevices: 1,
    maxStreams: 1,
    maxDeviceSwaps: 3,
    channelCount: 450,
    quality: "FHD",
    vod: true,
    featured: true,
    features: [
      { ar: "باقة القنوات الموسعة", en: "Expanded channel line-up" },
      { ar: "أفلام ومسلسلات عند الطلب", en: "Movies and series on demand" },
    ],
  },
  {
    slug: "family",
    name: { ar: "العائلة", en: "Family" },
    description: { ar: "حتى 3 شاشات في نفس الوقت", en: "Up to 3 screens at once" },
    durationDays: 365,
    maxDevices: 3,
    maxStreams: 3,
    maxDeviceSwaps: 6,
    channelCount: 450,
    quality: "4K",
    vod: true,
    featured: false,
    features: [
      { ar: "كل ما في بريميوم", en: "Everything in Premium" },
      { ar: "قسم الأطفال", en: "Kids section" },
    ],
  },
];

export const packagesFor = (market: string): Package[] => PACKAGES.map((p) => ({ ...p, price: priceFor(p.slug, market) }));
export const packageDef = (slug: string) => PACKAGES.find((p) => p.slug === slug);

export const COUNTRIES: Country[] = [
  { id: "jo", name: { ar: "الأردن", en: "Jordan" } },
  { id: "sa", name: { ar: "السعودية", en: "Saudi Arabia" } },
  { id: "ae", name: { ar: "الإمارات", en: "UAE" } },
  { id: "eg", name: { ar: "مصر", en: "Egypt" } },
  { id: "lb", name: { ar: "لبنان", en: "Lebanon" } },
  { id: "iq", name: { ar: "العراق", en: "Iraq" } },
  { id: "ps", name: { ar: "فلسطين", en: "Palestine" } },
  { id: "kw", name: { ar: "الكويت", en: "Kuwait" } },
  { id: "qa", name: { ar: "قطر", en: "Qatar" } },
  { id: "bh", name: { ar: "البحرين", en: "Bahrain" } },
  { id: "om", name: { ar: "عُمان", en: "Oman" } },
];

export const CATEGORIES: Category[] = [
  { id: "news", name: { ar: "أخبار", en: "News" } },
  { id: "entertainment", name: { ar: "ترفيه", en: "Entertainment" } },
  { id: "sports", name: { ar: "رياضة", en: "Sports" } },
  { id: "kids", name: { ar: "أطفال", en: "Kids" } },
  { id: "religious", name: { ar: "دينية", en: "Religious" } },
  { id: "movies", name: { ar: "أفلام", en: "Movies" } },
  { id: "general", name: { ar: "عامة", en: "General" } },
  { id: "documentary", name: { ar: "وثائقية", en: "Documentary" } },
];

// Placeholder names; [ar, en, country, category, lowest package]
const SEED: [string, string, string, string, "basic" | "premium" | "family"][] = [
  ["الأردن الإخبارية", "Jordan News", "jo", "news", "basic"],
  ["الأردن دراما", "Jordan Drama", "jo", "entertainment", "basic"],
  ["الأردن رياضة", "Jordan Sport", "jo", "sports", "premium"],
  ["عمّان العامة", "Amman General", "jo", "general", "basic"],
  ["الخليج نيوز", "Gulf News TV", "sa", "news", "basic"],
  ["الرياض دراما", "Riyadh Drama", "sa", "entertainment", "basic"],
  ["الصحراء رياضة 1", "Desert Sports 1", "sa", "sports", "premium"],
  ["الصحراء رياضة 2", "Desert Sports 2", "sa", "sports", "premium"],
  ["القرآن مباشر", "Quran Live", "sa", "religious", "basic"],
  ["دبي سينما", "Dubai Cinema", "ae", "movies", "premium"],
  ["الإمارات وثائقي", "Emirates Docs", "ae", "documentary", "premium"],
  ["أبوظبي عائلة", "Abu Dhabi Family", "ae", "general", "basic"],
  ["النيل أفلام", "Nile Movies", "eg", "movies", "premium"],
  ["القاهرة كوميدي", "Cairo Comedy", "eg", "entertainment", "basic"],
  ["مصر أطفال", "Egypt Kids", "eg", "kids", "family"],
  ["النيل الإخبارية", "Nile News", "eg", "news", "basic"],
  ["بيروت منوعات", "Beirut Variety", "lb", "entertainment", "basic"],
  ["لبنان موسيقى", "Lebanon Music", "lb", "general", "premium"],
  ["بغداد الإخبارية", "Baghdad News", "iq", "news", "basic"],
  ["الرافدين دراما", "Rafidain Drama", "iq", "entertainment", "premium"],
  ["فلسطين اليوم", "Palestine Today", "ps", "news", "basic"],
  ["القدس ثقافة", "Al-Quds Culture", "ps", "documentary", "premium"],
  ["الكويت العامة", "Kuwait General", "kw", "general", "basic"],
  ["الكويت رياضة", "Kuwait Sport", "kw", "sports", "premium"],
  ["الدوحة وثائقي", "Doha Docs", "qa", "documentary", "premium"],
  ["قطر أطفال", "Qatar Kids", "qa", "kids", "family"],
  ["البحرين العامة", "Bahrain General", "bh", "general", "basic"],
  ["مسقط دراما", "Muscat Drama", "om", "entertainment", "basic"],
  ["كرتون عربي", "Arabic Cartoons", "ae", "kids", "family"],
  ["World Docs", "World Docs", "ae", "documentary", "premium"],
];

const SHOWS: [L10n, L10n][] = [
  [{ ar: "نشرة الأخبار", en: "News Bulletin" }, { ar: "حوار اليوم", en: "Today's Talk" }],
  [{ ar: "مسلسل الحارة", en: "The Neighborhood" }, { ar: "سهرة الخميس", en: "Thursday Night" }],
  [{ ar: "الدوري مباشر", en: "League Live" }, { ar: "استوديو التحليل", en: "Analysis Studio" }],
  [{ ar: "صباح الخير", en: "Good Morning" }, { ar: "مطبخنا", en: "Our Kitchen" }],
  [{ ar: "فيلم السهرة", en: "Feature Film" }, { ar: "خلف الكواليس", en: "Behind the Scenes" }],
  [{ ar: "عالم الحيوان", en: "Animal World" }, { ar: "رحلات", en: "Journeys" }],
];

const TIERS = ["basic", "premium", "family"];
export const CHANNELS: Channel[] = SEED.map(([ar, en, country, category, min], i) => {
  const [now, next] = SHOWS[i % SHOWS.length];
  const h = 18 + (i % 4);
  return {
    id: `ch-${i + 1}`,
    name: { ar, en },
    country,
    category,
    language: ar === en ? "en" : "ar",
    packages: TIERS.slice(TIERS.indexOf(min)),
    now: { title: now, start: `${h}:00`, end: `${h + 1}:00` },
    next: { title: next },
  };
});
