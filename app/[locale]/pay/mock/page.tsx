"use client";

// Stand-in for the gateway's hosted payment page. In production the browser
// goes to the gateway's own domain; this route exists only in mock mode.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth-shell";
import { useLocale } from "@/components/locale";
import { Button, Card, Field, Input, Notice, Spinner } from "@/components/ui";
import { api } from "@/lib/api/client";
import type { Order } from "@/lib/api/types";

export default function MockGatewayPage() {
  return <RequireAuth>{() => <Gateway />}</RequireAuth>;
}

function Gateway() {
  const { t, href, price } = useLocale();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("order");
    if (id) api.orders.get(id).then((r) => setOrder(r.order), () => router.replace(href("/packages")));
  }, [href, router]);

  if (!order) return <div className="grid place-items-center py-32 text-muted"><Spinner /></div>;

  const finish = async (success: boolean) => {
    setBusy(true);
    await api.mockGateway.complete(order.id, success);
    router.push(`${href("/checkout/result")}?order=${order.id}`);
  };

  return (
    <div className="mx-auto max-w-md py-14">
      <Card className="space-y-5 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-fg">{t.gateway.title}</h1>
          <span className="text-xs font-semibold text-muted">3-D Secure</span>
        </div>
        <Notice tone="warn">{t.gateway.note}</Notice>
        <div className="flex justify-between rounded-xl bg-surface-2 p-4">
          <span className="text-muted">{t.gateway.amount}</span>
          <span className="font-bold text-fg">{price(order.price)}</span>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            finish(true);
          }}
        >
          {/* Uncontrolled and never submitted anywhere: card data stays on the gateway in production. */}
          <Field label={t.gateway.cardNumber}><Input dir="ltr" inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="off" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.gateway.expiry}><Input dir="ltr" placeholder="MM/YY" autoComplete="off" /></Field>
            <Field label={t.gateway.cvc}><Input dir="ltr" placeholder="123" autoComplete="off" /></Field>
          </div>
          <Button type="submit" className="w-full py-3" disabled={busy}>{busy && <Spinner />}{t.gateway.pay} {price(order.price)}</Button>
        </form>
        <div className="flex justify-between text-sm">
          <button className="text-red-500" disabled={busy} onClick={() => finish(false)}>{t.gateway.decline}</button>
          <button className="text-muted hover:text-fg" disabled={busy} onClick={() => router.push(`${href("/checkout")}?package=${order.packageSlug}`)}>{t.gateway.cancel}</button>
        </div>
      </Card>
    </div>
  );
}
