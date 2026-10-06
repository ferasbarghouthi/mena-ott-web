"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useLocale } from "@/components/locale";
import { Button, Field, Input, L, Notice, Spinner } from "@/components/ui";
import { api } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [id, setId] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <AuthShell title={t.auth.forgotTitle} footer={<L href="/login" className="font-semibold text-brand">{t.nav.login}</L>}>
      <p className="mb-5 text-sm text-muted">{t.auth.forgotSub}</p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!id.trim()) return;
          setBusy(true);
          await api.auth.passwordForgot(id.trim());
          setBusy(false);
          setSent(true);
        }}
      >
        <Field label={t.auth.identifier}><Input value={id} onChange={(e) => setId(e.target.value)} dir="ltr" autoComplete="username" /></Field>
        {/* Same message whether or not the account exists. */}
        {sent && <Notice tone="ok">{t.auth.resetSent} <L href="/reset-password?token=demo" className="underline">→</L></Notice>}
        <Button type="submit" className="w-full py-3" disabled={busy}>{busy && <Spinner />}{t.auth.send}</Button>
      </form>
    </AuthShell>
  );
}
