"use client";

import { AccountShell } from "@/components/account-shell";
import { useLocale } from "@/components/locale";
import { RenewButton, StatusBanner, useStatusText } from "@/components/subscription-status";
import { Card, LinkButton, Notice, Spinner, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api/client";
import { useQuery } from "@/lib/api/hooks";
import { FEATURES } from "@/lib/features";
import { currentOf, daysUntil } from "@/lib/format";

export default function AccountPage() {
  return <AccountShell>{() => <Overview />}</AccountShell>;
}

function Overview() {
  const { t, l, date } = useLocale();
  const statusText = useStatusText();
  const { data: subs } = useQuery(() => api.subscriptions.list(), [], 3000);
  const { data: devices } = useQuery(() => api.devices.list(), [], 3000);
  const { data: packages } = useQuery(() => api.catalog.packages());

  if (!subs || !devices || !packages) return <div className="grid place-items-center py-20 text-muted"><Spinner /></div>;
  const sub = currentOf(subs);
  if (!sub)
    return (
      <Card className="text-center">
        <h2 className="text-xl font-bold text-fg">{t.account.noSub}</h2>
        <p className="mt-2 text-muted">{t.account.noSubSub}</p>
        <LinkButton href="/packages" className="mt-6">{t.home.ctaPackages}</LinkButton>
      </Card>
    );

  const pkg = packages.find((p) => p.slug === sub.packageSlug);
  const left = daysUntil(sub.endsAt);
  const mine = devices.filter((d) => d.subscriptionId === sub.id);
  const canRenew = sub.status === "ACTIVE" || sub.status === "EXPIRED";
  const canAdd = (sub.status === "ACTIVE" || sub.status === "PENDING_DEVICE") && pkg && mine.filter((d) => d.status !== "EXPIRED").length < pkg.maxDevices;

  return (
    <div className="space-y-6">
      <StatusBanner sub={sub} />
      {sub.status === "ACTIVE" && left <= 30 && <Notice tone="warn">{t.account.expiringSoon.replace("{n}", String(left))}</Notice>}
      {sub.status === "EXPIRED" && (
        <Notice tone="warn">
          <div className="flex flex-wrap items-center justify-between gap-3"><span>{statusText(sub)}</span><RenewButton sub={sub} /></div>
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.account.currentPackage} value={pkg ? l(pkg.name) : sub.packageSlug} />
        <Stat label={t.account.status} value={<StatusBadge status={sub.status} />} />
        <Stat label={t.account.expiry} value={sub.endsAt ? date(sub.endsAt) : "—"} />
        <Stat
          label={t.account.daysLeft}
          value={
            sub.endsAt ? (
              <div>
                {left} <span className="text-sm font-normal text-muted">{t.account.days}</span>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${Math.min(100, (left / (pkg?.durationDays ?? 365)) * 100)}%` }} />
                </div>
              </div>
            ) : "—"
          }
        />
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-muted">{t.account.devicesTitle}</h2>
        {mine.length ? (
          <ul className="space-y-2">
            {mine.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-fg">📺 {d.name} <span className="text-xs font-normal text-muted">{d.model}</span></span>
                <StatusBadge status={d.status} kind="device" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t.account.noDevice}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          {canRenew && <RenewButton sub={sub} />}
          {canAdd && <LinkButton href={`/activate?subscription=${sub.id}`} variant="secondary">{t.account.addDevice}</LinkButton>}
          {mine.length > 0 && <LinkButton href="/account/devices" variant="secondary">{t.account.replaceDevice}</LinkButton>}
          {FEATURES.upgrade && <LinkButton href="/account/subscription" variant="secondary">{t.account.upgrade}</LinkButton>}
          <LinkButton href="/support" variant="ghost">{t.account.contactSupport}</LinkButton>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-2 text-xl font-bold text-fg">{value}</div>
    </Card>
  );
}
