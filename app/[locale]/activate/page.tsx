"use client";

// Short link shown on the TV (and behind its QR code, which carries ?code=).
// Enter code -> log in if needed -> pick the subscription -> pair.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CodeInput, PAIRING_RE } from "@/components/code-input";
import { useLocale } from "@/components/locale";
import { Button, Card, cx, LinkButton, Notice, Spinner, StatusBadge } from "@/components/ui";
import { track } from "@/lib/analytics";
import { api } from "@/lib/api/client";
import { useMe, useQuery } from "@/lib/api/hooks";
import type { ApiError } from "@/lib/api/types";
import { errorText } from "@/lib/i18n";

export default function ActivatePage() {
  const { t, l, href } = useLocale();
  const router = useRouter();
  const { data: me, loading: meLoading } = useMe();
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"code" | "choose" | "done">("code");
  const [subId, setSubId] = useState<string | null>(null);
  const [err, setErr] = useState<ApiError | string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: subs } = useQuery(() => (me ? api.subscriptions.list() : Promise.resolve([])), [me?.id]);
  const { data: devices } = useQuery(() => (me ? api.devices.list() : Promise.resolve([])), [me?.id]);
  const { data: packages } = useQuery(() => api.catalog.packages());

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("code");
    if (c) setCode(c);
    if (q.get("subscription")) setSubId(q.get("subscription"));
    if (c && PAIRING_RE.test(c) && q.get("step") === "choose") setStep("choose");
  }, []);

  const eligible = (subs ?? []).filter((s) => s.status === "ACTIVE" || s.status === "PENDING_DEVICE");
  const pkgOf = (slug: string) => packages?.find((p) => p.slug === slug);
  const used = (id: string) => (devices ?? []).filter((d) => d.subscriptionId === id && (d.status === "ACTIVE" || d.status === "PENDING")).length;
  const chosen = subId && eligible.some((s) => s.id === subId) ? subId : eligible[0]?.id;

  const toChoose = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!PAIRING_RE.test(code)) return setErr(t.checkout.errCode);
    if (!me) return router.push(`${href("/login")}?next=${encodeURIComponent(`${href("/activate")}?code=${code}&step=choose`)}`);
    setStep("choose");
  };

  const pair = async () => {
    if (!chosen) return;
    setBusy(true);
    setErr(null);
    try {
      await api.devices.pair(code, chosen);
      track("pair_device", { package: eligible.find((s) => s.id === chosen)!.packageSlug });
      setStep("done");
    } catch (e) {
      setErr(e as ApiError);
    } finally {
      setBusy(false);
    }
  };

  const errCode = typeof err === "object" && err ? err.code : null;

  return (
    <div className="mx-auto max-w-md py-14">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-fg">{t.activate.title}</h1>

        {step === "code" && (
          <form onSubmit={toChoose} className="mt-6 space-y-4" noValidate>
            <p className="text-sm text-muted">{t.activate.sub}</p>
            <label className="sr-only" htmlFor="code">{t.activate.code}</label>
            <CodeInput id="code" value={code} onChange={setCode} autoFocus />
            {!meLoading && !me && <p className="text-xs text-muted">{t.activate.loginHint}</p>}
            {err && <Notice tone="error">{typeof err === "string" ? err : errorText(t, err)}</Notice>}
            <Button type="submit" className="w-full py-3">{t.activate.continue}</Button>
            <p className="text-center text-xs text-muted">{t.auth.captcha}</p>
          </form>
        )}

        {step === "choose" && (
          <div className="mt-6 space-y-4">
            <p className="text-center font-mono text-xl font-bold tracking-[0.2em] text-fg" dir="ltr">{code}</p>
            {!subs ? (
              <div className="grid place-items-center py-8 text-muted"><Spinner /></div>
            ) : eligible.length === 0 ? (
              <>
                <Notice>{t.activate.noSub}</Notice>
                <LinkButton href={`/checkout?code=${code}`} className="w-full py-3">{t.activate.choosePackage}</LinkButton>
              </>
            ) : (
              <>
                <div>
                  <h2 className="font-semibold text-fg">{t.activate.chooseSub}</h2>
                  <p className="text-sm text-muted">{t.activate.chooseSubSub}</p>
                </div>
                <div className="space-y-2" role="radiogroup">
                  {eligible.map((s) => {
                    const p = pkgOf(s.packageSlug);
                    return (
                      <button
                        key={s.id}
                        role="radio"
                        aria-checked={chosen === s.id}
                        onClick={() => setSubId(s.id)}
                        className={cx("flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-start", chosen === s.id ? "border-brand bg-brand/10" : "border-line")}
                      >
                        <span>
                          <span className="block font-semibold text-fg">{p ? l(p.name) : s.packageSlug}</span>
                          <span className="text-xs text-muted">{p ? `${p.maxDevices - used(s.id)} ${t.activate.devicesLeft}` : ""}</span>
                        </span>
                        <StatusBadge status={s.status} />
                      </button>
                    );
                  })}
                </div>
                {err && (
                  <Notice tone="error">
                    {errorText(t, err)}
                    {errCode === "DEVICE_LIMIT_REACHED" && (
                      <> <LinkButton href={`/account/devices?code=${code}`} variant="secondary" className="mt-3 w-full">{t.activate.replaceInstead}</LinkButton></>
                    )}
                  </Notice>
                )}
                {(errCode === "PAIRING_CODE_EXPIRED" || errCode === "PAIRING_CODE_INVALID") ? (
                  <Button variant="secondary" className="w-full" onClick={() => { setStep("code"); setCode(""); setErr(null); }}>{t.common.back}</Button>
                ) : (
                  <Button className="w-full py-3" onClick={pair} disabled={busy}>{busy && <Spinner />}{t.activate.pair}</Button>
                )}
              </>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="mt-6 space-y-5 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-2xl text-emerald-500">✓</div>
            <p className="text-fg">{t.activate.done}</p>
            <LinkButton href="/account/devices">{t.activate.goDevices}</LinkButton>
          </div>
        )}
      </Card>
    </div>
  );
}
