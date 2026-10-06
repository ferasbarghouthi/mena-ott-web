"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useLocale } from "@/components/locale";
import { Button, Field, Input, L, Notice, Spinner } from "@/components/ui";
import { api } from "@/lib/api/client";
import { errorText } from "@/lib/i18n";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <AuthShell title={t.auth.resetTitle}>
      {done ? (
        <div className="space-y-4">
          <Notice tone="ok">{t.auth.resetDone}</Notice>
          <L href="/login" className="font-semibold text-brand">{t.nav.login}</L>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (pw.length < 8) return setErr(t.auth.errPassword);
            setBusy(true);
            try {
              const token = new URLSearchParams(window.location.search).get("token") ?? "";
              await api.auth.passwordReset(token, pw);
              setDone(true);
            } catch (e) {
              setErr(errorText(t, e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label={t.auth.newPassword} hint={t.auth.passwordHint}>
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} dir="ltr" autoComplete="new-password" />
          </Field>
          {err && <Notice tone="error">{err}</Notice>}
          <Button type="submit" className="w-full py-3" disabled={busy}>{busy && <Spinner />}{t.common.save}</Button>
        </form>
      )}
    </AuthShell>
  );
}
