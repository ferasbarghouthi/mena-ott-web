"use client";

import { useState } from "react";
import { AccountShell } from "@/components/account-shell";
import { useLocale } from "@/components/locale";
import { Button, Card, Field, Input, L, Notice, Spinner } from "@/components/ui";
import { api } from "@/lib/api/client";
import type { Me } from "@/lib/api/types";
import { errorText } from "@/lib/i18n";
import { toE164 } from "@/lib/phone";

export default function ProfilePage() {
  return <AccountShell>{(me) => <Profile me={me} />}</AccountShell>;
}

function Profile({ me }: { me: Me }) {
  const { t } = useLocale();
  const [f, setF] = useState({ name: me.name, email: me.email, mobile: me.mobile });
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const mobile = f.mobile ? toE164(f.mobile) : "";
      await api.me.patch({ ...f, mobile });
      if (mobile && mobile !== me.mobile) await api.auth.otpSend(mobile, "verify");
      setMsg({ tone: "ok", text: t.profile.saved });
    } catch (err) {
      setMsg({ tone: "error", text: errorText(t, err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 text-lg font-bold text-fg">{t.profile.details}</h2>
        <form onSubmit={save} className="space-y-4">
          <Field label={t.auth.name}><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
          <Field label={t.auth.email}><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} dir="ltr" type="email" autoComplete="email" /></Field>
          <Field label={t.auth.mobile} hint={t.profile.changeMobileHint}>
            <Input value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} dir="ltr" inputMode="tel" autoComplete="tel" />
          </Field>
          {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
          <Button type="submit" disabled={busy}>{busy && <Spinner />}{t.common.save}</Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-bold text-fg">{t.profile.security}</h2>
        <div className="space-y-3">
          <L href="/forgot-password" className="block font-semibold text-brand">{t.profile.changePassword}</L>
          <Button
            variant="secondary"
            onClick={async () => {
              await api.auth.logoutAll();
              setMsg({ tone: "ok", text: t.profile.loggedOutAll });
            }}
          >
            {t.profile.logoutAll}
          </Button>
        </div>
      </Card>
    </div>
  );
}
