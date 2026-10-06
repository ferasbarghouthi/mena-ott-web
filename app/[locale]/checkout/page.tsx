"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth-shell";
import { CodeInput, PAIRING_RE } from "@/components/code-input";
import { useLocale } from "@/components/locale";
import { durationLabel } from "@/components/packages";
import { goToPayment } from "@/components/pay-redirect";
import { Button, Card, Field, Input, L, Notice, Select, Spinner } from "@/components/ui";
import { track } from "@/lib/analytics";
import { api } from "@/lib/api/client";
import { useQuery } from "@/lib/api/hooks";
import { FEATURES } from "@/lib/features";
import { errorText } from "@/lib/i18n";

export default function CheckoutPage() {
  return <RequireAuth>{() => <Checkout />}</RequireAuth>;
}

function Checkout() {
  const { t, l, href, price } = useLocale();
  const router = useRouter();
  const { data: packages } = useQuery(() => api.catalog.packages());
  const [slug, setSlug] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setSlug(q.get("package"));
    if (q.get("code")) setCode(q.get("code")!);
  }, []);

  const pkg = packages?.find((p) => p.slug === slug) ?? packages?.find((p) => p.featured) ?? packages?.[0];
  useEffect(() => {
    if (pkg) track("begin_checkout", { package: pkg.slug });
  }, [pkg?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!packages || !pkg) return <div className="grid place-items-center py-32 text-muted"><Spinner /></div>;

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (code && !PAIRING_RE.test(code)) return setErr(t.checkout.errCode);
    if (!terms) return setErr(t.checkout.errTerms);
    setBusy(true);
    try {
      const { paymentUrl } = await api.orders.create({ packageSlug: pkg.slug, pairingCode: code || undefined });
      goToPayment(paymentUrl, href, router.push);
    } catch (e) {
      setErr(errorText(t, e));
      setBusy(false);
    }
  };

  const net = { amountMinor: pkg.price.amountMinor - pkg.price.taxMinor, currency: pkg.price.currency };
  return (
    <div className="mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold text-fg">{t.checkout.title}</h1>
      <form onSubmit={pay} className="grid gap-6 lg:grid-cols-[1fr_340px]" noValidate>
        <Card className="space-y-6">
          <Field label={t.checkout.package}>
            <Select value={pkg.slug} onChange={(e) => setSlug(e.target.value)}>
              {packages.map((p) => (
                <option key={p.slug} value={p.slug}>{l(p.name)} · {durationLabel(p.durationDays, t)} · {price(p.price)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.checkout.tvCode} hint={t.checkout.tvCodeHint}>
            <CodeInput value={code} onChange={setCode} />
          </Field>
          <p className="text-xs text-muted">{t.checkout.demoHint}</p>
          {FEATURES.coupons && (
            <Field label={t.checkout.coupon}><Input dir="ltr" className="uppercase" /></Field>
          )}
          <label className="flex items-start gap-2 text-sm text-fg">
            <input type="checkbox" className="mt-1 accent-[var(--color-brand)]" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>
              {t.checkout.acceptTerms} <L href="/terms" className="text-brand underline">{t.legal.terms}</L> {t.checkout.and}{" "}
              <L href="/refund-policy" className="text-brand underline">{t.legal.refund}</L>
            </span>
          </label>
          {err && <Notice tone="error">{err}</Notice>}
        </Card>

        <aside>
          <Card className="lg:sticky lg:top-24">
            <h2 className="mb-4 font-bold text-fg">{t.checkout.summary}</h2>
            <p className="font-semibold text-fg">{l(pkg.name)} · {durationLabel(pkg.durationDays, t)}</p>
            <p className="mt-1 text-xs text-muted">
              {pkg.channelCount}+ {t.pkg.channels} · {pkg.maxDevices} {pkg.maxDevices === 1 ? t.pkg.device : t.pkg.devices} · {pkg.quality}
            </p>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">{t.checkout.subtotal}</dt><dd className="text-fg">{price(net)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-muted">{t.checkout.tax} ({Math.round(pkg.price.taxRate * 100)}%)</dt>
                <dd className="text-fg">{price({ amountMinor: pkg.price.taxMinor, currency: pkg.price.currency })}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt className="text-fg">{t.checkout.total}</dt><dd className="text-fg">{price(pkg.price)}</dd></div>
            </dl>
            <Button type="submit" className="mt-6 w-full py-3" disabled={busy}>{busy && <Spinner />}{t.checkout.pay}</Button>
            <p className="mt-3 text-xs text-muted">🔒 {t.checkout.secure}</p>
          </Card>
        </aside>
      </form>
    </div>
  );
}
