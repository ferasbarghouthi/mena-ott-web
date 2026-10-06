"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, nextPath } from "@/components/auth-shell";
import { useLocale } from "@/components/locale";
import { Button, Field, Input, L, Notice, Spinner } from "@/components/ui";
import { api } from "@/lib/api/client";
import { errorText } from "@/lib/i18n";
import { E164_RE, toE164 } from "@/lib/phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { t, href } = useLocale();
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", mobile: "", password: "" });
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const mobile = toE164(f.mobile);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (step === "form") {
      if (!f.name || !f.email || !f.mobile || !f.password) return setErr(t.auth.errRequired);
      if (!E164_RE.test(mobile)) return setErr(t.auth.errMobile);
      if (!EMAIL_RE.test(f.email)) return setErr(t.auth.errEmail);
      if (f.password.length < 8) return setErr(t.auth.errPassword);
      if (!terms || !privacy) return setErr(t.auth.errTerms);
    }
    setBusy(true);
    try {
      if (step === "form") {
        await api.auth.register({ ...f, mobile, consents: ["terms", "privacy"] });
        setStep("otp");
      } else {
        await api.auth.otpVerify(otp, mobile);
        router.push(nextPath(href("/packages")));
      }
    } catch (e) {
      setErr(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={step === "otp" ? t.auth.verifyMobile : t.auth.registerTitle} footer={<>{t.auth.haveAccount} <L href="/login" className="font-semibold text-brand">{t.nav.login}</L></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {step === "form" ? (
          <>
            <Field label={t.auth.name}><Input value={f.name} onChange={up("name")} autoComplete="name" /></Field>
            <Field label={t.auth.mobile} hint={f.mobile ? mobile : undefined}>
              <div className="flex gap-2" dir="ltr">
                <span className="grid place-items-center rounded-xl border border-line bg-surface-2 px-3 text-sm text-muted">+962</span>
                <Input value={f.mobile} onChange={up("mobile")} inputMode="tel" autoComplete="tel-national" placeholder="7X XXX XXXX" />
              </div>
            </Field>
            <Field label={t.auth.email}><Input value={f.email} onChange={up("email")} dir="ltr" type="email" autoComplete="email" /></Field>
            <Field label={t.auth.password} hint={t.auth.passwordHint}><Input value={f.password} onChange={up("password")} dir="ltr" type="password" autoComplete="new-password" /></Field>
            <label className="flex items-start gap-2 text-sm text-fg">
              <input type="checkbox" className="mt-1 accent-[var(--color-brand)]" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span>{t.auth.acceptTerms} <L href="/terms" className="text-brand underline">{t.legal.terms}</L></span>
            </label>
            <label className="flex items-start gap-2 text-sm text-fg">
              <input type="checkbox" className="mt-1 accent-[var(--color-brand)]" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
              <span>{t.auth.acceptPrivacy} <L href="/privacy" className="text-brand underline">{t.legal.privacy}</L></span>
            </label>
          </>
        ) : (
          <Field label={t.auth.otp} hint={`${t.auth.otpSent} ${mobile} · ${t.auth.otpDemo}`}>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} dir="ltr" inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="tracking-[0.5em]" autoFocus />
          </Field>
        )}
        {err && <Notice tone="error">{err}</Notice>}
        <Button type="submit" className="w-full py-3" disabled={busy}>
          {busy && <Spinner />}
          {step === "otp" ? t.auth.verify : t.auth.submitRegister}
        </Button>
        <p className="text-center text-xs text-muted">{t.auth.captcha}</p>
      </form>
    </AuthShell>
  );
}
