"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, nextPath } from "@/components/auth-shell";
import { useLocale } from "@/components/locale";
import { Button, Field, Input, L, Notice, Spinner } from "@/components/ui";
import { api } from "@/lib/api/client";
import { errorText } from "@/lib/i18n";
import { E164_RE, toE164 } from "@/lib/phone";

export default function LoginPage() {
  const { t, href } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const done = () => router.push(nextPath(href("/account")));
  const run = async (fn: () => Promise<void>) => {
    setErr("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "otp") {
      const mobile = toE164(id);
      if (!E164_RE.test(mobile)) return setErr(t.auth.errMobile);
      if (!otpSent) return run(async () => { await api.auth.otpSend(mobile, "login"); setOtpSent(true); });
      return run(async () => { await api.auth.otpVerify(otp, mobile); done(); });
    }
    if (!id || !pw) return setErr(t.auth.errRequired);
    run(async () => { await api.auth.login(id.includes("@") ? id.trim() : toE164(id), pw); done(); });
  };

  return (
    <AuthShell title={t.auth.loginTitle} footer={<>{t.auth.noAccount} <L href="/register" className="font-semibold text-brand">{t.nav.register}</L></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label={mode === "otp" ? t.auth.mobile : t.auth.identifier}>
          <Input value={id} onChange={(e) => setId(e.target.value)} dir="ltr" autoComplete="username" inputMode={mode === "otp" ? "tel" : "email"} placeholder={mode === "otp" ? "+962 7X XXX XXXX" : ""} />
        </Field>
        {mode === "password" && (
          <Field label={t.auth.password}>
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} dir="ltr" autoComplete="current-password" />
          </Field>
        )}
        {mode === "otp" && otpSent && (
          <Field label={t.auth.otp} hint={`${t.auth.otpSent} ${toE164(id)} · ${t.auth.otpDemo}`}>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} dir="ltr" inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="tracking-[0.5em]" />
          </Field>
        )}
        {err && <Notice tone="error">{err}</Notice>}
        <Button type="submit" className="w-full py-3" disabled={busy}>
          {busy && <Spinner />}
          {mode === "otp" ? (otpSent ? t.auth.verify : t.auth.sendOtp) : t.auth.submitLogin}
        </Button>
        <p className="text-center text-xs text-muted">{t.auth.captcha}</p>
      </form>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        <button className="text-brand" onClick={() => { setMode(mode === "otp" ? "password" : "otp"); setErr(""); setOtpSent(false); }}>
          {mode === "otp" ? t.auth.passwordLogin : t.auth.otpLogin}
        </button>
        <L href="/forgot-password" className="text-muted hover:text-fg">{t.auth.forgot}</L>
      </div>
      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />{t.common.or}<span className="h-px flex-1 bg-line" />
      </div>
      <Button variant="secondary" className="w-full" disabled={busy} onClick={() => run(async () => { await api.auth.loginDemo(); done(); })}>
        {t.auth.demo}
      </Button>
    </AuthShell>
  );
}
