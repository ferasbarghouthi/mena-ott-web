"use client";

// Reads the order's state from the backend (GET /orders/{id}), never from
// the gateway's redirect query string, and polls until it settles.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RequireAuth } from "@/components/auth-shell";
import { useLocale } from "@/components/locale";
import { goToPayment } from "@/components/pay-redirect";
import { Button, Card, L, LinkButton, Notice, Spinner } from "@/components/ui";
import { track } from "@/lib/analytics";
import { api } from "@/lib/api/client";
import { useQuery } from "@/lib/api/hooks";
import { errorText } from "@/lib/i18n";

export default function CheckoutResultPage() {
  return <RequireAuth>{() => <Result />}</RequireAuth>;
}

function Result() {
  const { t, date } = useLocale();
  const [orderId, setOrderId] = useState<string | null>(null);
  useEffect(() => setOrderId(new URLSearchParams(window.location.search).get("order")), []);
  const { data, error } = useQuery(() => (orderId ? api.orders.get(orderId) : Promise.resolve(null)), [orderId], 1500);
  const tracked = useRef<string | null>(null);

  const order = data?.order;
  const sub = data?.subscription;
  useEffect(() => {
    if (!order) return;
    if (order.status === "PAID" && tracked.current !== "purchase") {
      track("purchase", { package: order.packageSlug, kind: order.kind });
      tracked.current = "purchase";
    }
    if (sub?.status === "ACTIVATION_FAILED" && tracked.current !== "failed") {
      track("activation_failed", { package: order.packageSlug });
      tracked.current = "failed";
    }
  }, [order, sub?.status]);

  if (error) return <Shell icon="!" title={t.errors.generic}><LinkButton href="/account">{t.result.dashboard}</LinkButton></Shell>;
  if (!order) return <div className="grid place-items-center py-32 text-muted"><Spinner /></div>;

  const ref = <p className="mt-6 text-xs text-muted">{t.result.order}: <span dir="ltr" className="font-mono">{order.id}</span></p>;

  if (order.status === "FAILED")
    return (
      <Shell icon="✕" tone="bad" title={t.result.failedPayTitle} sub={t.result.failedPaySub}>
        <RetryPayment orderId={order.id} />
        {ref}
      </Shell>
    );
  if (order.status === "PENDING_PAYMENT" || !sub)
    return <Shell icon={<Spinner />} title={t.result.processing} sub={t.result.processingSub}>{ref}</Shell>;
  if (sub.status === "PENDING_ACTIVATION")
    return <Shell icon={<Spinner />} title={t.result.activating}>{ref}</Shell>;
  if (sub.status === "PENDING_DEVICE")
    return (
      <Shell icon="✓" tone="ok" title={t.result.pairTitle} sub={t.result.pairSub}>
        <LinkButton href={`/activate?subscription=${sub.id}`}>{t.result.pairCta}</LinkButton>
        <p className="mt-4"><L href="/setup" className="text-sm text-brand">{t.nav.setup}</L></p>
        {ref}
      </Shell>
    );
  if (sub.status === "ACTIVATION_FAILED")
    return (
      <Shell icon="⏳" tone="warn" title={t.result.failedActTitle} sub={t.status.text.ACTIVATION_FAILED}>
        <div className="flex justify-center gap-2">
          <LinkButton href="/support">{t.status.action.ACTIVATION_FAILED}</LinkButton>
          <LinkButton href="/account" variant="secondary">{t.result.dashboard}</LinkButton>
        </div>
        {ref}
      </Shell>
    );
  return order.kind === "renewal" ? (
    <Shell icon="✓" tone="ok" title={t.result.renewedTitle} sub={`${t.result.renewedSub} ${sub.endsAt ? date(sub.endsAt) : ""}`}>
      <LinkButton href="/account">{t.result.dashboard}</LinkButton>
      {ref}
    </Shell>
  ) : (
    <Shell icon="✓" tone="ok" title={t.result.successTitle} sub={t.result.successSub}>
      <LinkButton href="/account">{t.result.dashboard}</LinkButton>
      {ref}
    </Shell>
  );
}

/** New attempt on the same order (POST /orders/{id}/payment-attempts); one idempotency key per page, so a double tap is one attempt. */
function RetryPayment({ orderId }: { orderId: string }) {
  const { t, href } = useLocale();
  const router = useRouter();
  const key = useRef(crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="space-y-3">
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr("");
          try {
            const { paymentUrl } = await api.orders.retryPayment(orderId, key.current);
            goToPayment(paymentUrl, href, router.push);
          } catch (e) {
            setErr(errorText(t, e));
            setBusy(false);
          }
        }}
      >
        {busy && <Spinner />}
        {t.result.retry}
      </Button>
      {err && <Notice tone="error">{err}</Notice>}
    </div>
  );
}

function Shell({ icon, title, sub, tone, children }: { icon: React.ReactNode; title: string; sub?: string; tone?: "ok" | "warn" | "bad"; children?: React.ReactNode }) {
  const ring = tone === "ok" ? "bg-emerald-500/15 text-emerald-500" : tone === "warn" ? "bg-amber-500/15 text-amber-500" : tone === "bad" ? "bg-red-500/15 text-red-500" : "bg-brand/15 text-brand";
  return (
    <div className="mx-auto max-w-lg py-16">
      <Card className="py-10 text-center" >
        <div aria-live="polite">
          <div className={`mx-auto mb-5 grid size-14 place-items-center rounded-full text-2xl ${ring}`}>{icon}</div>
          <h1 className="text-2xl font-bold text-fg">{title}</h1>
          {sub && <p className="mx-auto mt-3 max-w-md text-muted">{sub}</p>}
        </div>
        <div className="mt-8">{children}</div>
      </Card>
    </div>
  );
}
