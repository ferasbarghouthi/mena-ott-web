"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";
import type { Subscription } from "@/lib/api/types";
import { errorText } from "@/lib/i18n";
import { useLocale } from "./locale";
import { goToPayment } from "./pay-redirect";
import { Button, LinkButton, Notice, Spinner } from "./ui";

/** The customer-facing status sentence (PRD v1.1 §5.3). */
export function useStatusText() {
  const { t, date } = useLocale();
  return (s: Subscription) => t.status.text[s.status].replace("{date}", s.endsAt ? date(s.endsAt) : "");
}

export function RenewButton({ sub, variant = "primary", label }: { sub: Subscription; variant?: "primary" | "secondary"; label?: string }) {
  const { t, href } = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <Button
        variant={variant}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const { paymentUrl } = await api.subscriptions.renew(sub.id);
            goToPayment(paymentUrl, href, router.push);
          } catch (e) {
            setErr(errorText(t, e));
            setBusy(false);
          }
        }}
      >
        {busy && <Spinner />}
        {label ?? t.account.renew}
      </Button>
      {err && <Notice tone="error">{err}</Notice>}
    </>
  );
}

/** Banner for the states that need the customer's attention. */
export function StatusBanner({ sub }: { sub: Subscription }) {
  const { t } = useLocale();
  const text = useStatusText()(sub);
  if (sub.status === "PENDING_DEVICE")
    return (
      <Notice tone="info">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{text}</span>
          <LinkButton href={`/activate?subscription=${sub.id}`}>{t.status.action.PENDING_DEVICE}</LinkButton>
        </div>
      </Notice>
    );
  if (sub.status === "ACTIVATION_FAILED" || sub.status === "SUSPENDED")
    return (
      <Notice tone="warn">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{text}</span>
          <LinkButton href="/support" variant="secondary">{t.status.action[sub.status]}</LinkButton>
        </div>
      </Notice>
    );
  if (sub.status === "PENDING_ACTIVATION")
    return (
      <Notice tone="info">
        <span className="inline-flex items-center gap-2"><Spinner /> {text}</span>
      </Notice>
    );
  return null;
}
