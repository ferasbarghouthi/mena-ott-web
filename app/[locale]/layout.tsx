import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LocaleProvider } from "@/components/locale";
import { isLocale, LOCALES } from "@/lib/i18n";
import { pageMeta, type LocaleParams } from "@/lib/seo";
import "../globals.css";

const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex" });

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams) {
  return pageMeta((await params).locale, "");
}

export default async function LocaleLayout({ children, params }: { children: ReactNode } & LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={plex.variable}>
      <body className="min-h-screen font-sans antialiased">
        <LocaleProvider locale={locale}>
          <Header />
          <main className="mx-auto max-w-6xl px-4">{children}</main>
          <Footer />
          <CookieBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
