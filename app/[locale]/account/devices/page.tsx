"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account-shell";
import { CodeInput, PAIRING_RE } from "@/components/code-input";
import { useLocale } from "@/components/locale";
import { Button, Card, Field, Input, LinkButton, Notice, Spinner, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api/client";
import { useQuery } from "@/lib/api/hooks";
import type { Device } from "@/lib/api/types";
import { currentOf } from "@/lib/format";
import { errorText } from "@/lib/i18n";

const PLATFORM_LABEL: Record<Device["platform"], string> = {
  android_tv: "Android TV",
  google_tv: "Google TV",
  tizen: "Samsung Tizen",
  webos: "LG webOS",
  android: "Android",
  ios: "iOS",
  web: "Web",
};

export default function DevicesPage() {
  return <AccountShell>{() => <Devices />}</AccountShell>;
}

function Devices() {
  const { t, date } = useLocale();
  const { data: subs } = useQuery(() => api.subscriptions.list(), [], 3000);
  const { data: devices } = useQuery(() => api.devices.list(), [], 3000);
  const { data: packages } = useQuery(() => api.catalog.packages());
  const [form, setForm] = useState<{ mode: "add" } | { mode: "replace"; device: Device } | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [presetCode, setPresetCode] = useState("");

  useEffect(() => setPresetCode(new URLSearchParams(window.location.search).get("code") ?? ""), []);

  if (!subs || !devices || !packages) return <div className="grid place-items-center py-20 text-muted"><Spinner /></div>;
  const sub = currentOf(subs);
  const pkg = packages.find((p) => p.slug === sub?.packageSlug);
  if (!sub || !pkg || !["ACTIVE", "PENDING_DEVICE", "PENDING_ACTIVATION", "ACTIVATION_FAILED"].includes(sub.status))
    return (
      <Card className="text-center">
        <p className="text-muted">{t.devices.needSub}</p>
        <LinkButton href="/packages" className="mt-5">{t.home.ctaPackages}</LinkButton>
      </Card>
    );

  const mine = devices.filter((d) => d.subscriptionId === sub.id);
  const live = mine.filter((d) => d.status === "ACTIVE" || d.status === "PENDING").length;
  const swapsLeft = pkg.maxDeviceSwaps - sub.deviceSwapsUsed;
  const canAdd = live < pkg.maxDevices && (sub.status === "ACTIVE" || sub.status === "PENDING_DEVICE");

  const open = (f: typeof form) => {
    setForm(f);
    setCode(presetCode);
    setErr("");
  };
  const submit = async () => {
    if (!form) return;
    if (!PAIRING_RE.test(code)) return setErr(t.checkout.errCode);
    setBusy(true);
    setErr("");
    try {
      if (form.mode === "add") await api.devices.pair(code, sub.id);
      else await api.devices.replace(form.device.id, code);
      setForm(null);
      setPresetCode("");
    } catch (e) {
      setErr(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {t.devices.allowed}: <b className="text-fg">{live} / {pkg.maxDevices}</b> · {Math.max(0, swapsLeft)} {t.devices.swapsLeft}
        </p>
        {canAdd && <Button onClick={() => open({ mode: "add" })} disabled={!!form}>+ {t.account.addDevice}</Button>}
      </div>

      {form && (
        <Card>
          <h2 className="mb-2 text-lg font-bold text-fg">{form.mode === "add" ? t.devices.addTitle : t.devices.replaceTitle}</h2>
          {form.mode === "replace" && <p className="mb-4 text-sm text-muted">{t.devices.replaceConfirm.replace("{name}", form.device.name)}</p>}
          <Field label={t.devices.newCode} hint={t.setup.codeNote}>
            <CodeInput value={code} onChange={setCode} autoFocus />
          </Field>
          {err && <div className="mt-4"><Notice tone="error">{err}</Notice></div>}
          <div className="mt-6 flex gap-2">
            <Button onClick={submit} disabled={busy}>{busy && <Spinner />}{form.mode === "add" ? t.devices.submit : t.devices.replace}</Button>
            <Button variant="ghost" onClick={() => setForm(null)}>{t.common.cancel}</Button>
          </div>
        </Card>
      )}

      {mine.length === 0 ? (
        <Card className="text-center text-muted">{t.devices.none}</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-3">
                {renaming?.id === d.id ? (
                  <form
                    className="flex flex-1 gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await api.devices.rename(d.id, renaming.name.trim() || d.name);
                      setRenaming(null);
                    }}
                  >
                    <Input value={renaming.name} onChange={(e) => setRenaming({ id: d.id, name: e.target.value })} autoFocus maxLength={40} aria-label={t.devices.rename} />
                    <Button type="submit" variant="secondary">{t.devices.save}</Button>
                  </form>
                ) : (
                  <h3 className="font-bold text-fg">📺 {d.name}</h3>
                )}
                <StatusBadge status={d.status} kind="device" />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-muted">{t.devices.platform}</dt><dd className="text-fg">{PLATFORM_LABEL[d.platform]}</dd></div>
                <div><dt className="text-muted">{t.devices.model}</dt><dd className="text-fg">{d.model}</dd></div>
                <div><dt className="text-muted">{t.devices.lastSeen}</dt><dd className="text-fg">{date(d.lastSeenAt)}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => setRenaming({ id: d.id, name: d.name })}>{t.devices.rename}</Button>
                <Button
                  variant="secondary"
                  disabled={swapsLeft <= 0 || !!form}
                  title={swapsLeft <= 0 ? t.errors.DEVICE_SWAPS_EXHAUSTED : undefined}
                  onClick={() => open({ mode: "replace", device: d })}
                >
                  {t.devices.replace}
                </Button>
                <Button variant="danger" onClick={() => confirm(t.devices.confirmRemove) && api.devices.remove(d.id)}>{t.devices.remove}</Button>
              </div>
              {swapsLeft <= 0 && <p className="mt-3 text-xs text-muted">{t.errors.DEVICE_SWAPS_EXHAUSTED}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
