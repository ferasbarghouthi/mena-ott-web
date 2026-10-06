"use client";

import { AccountShell } from "@/components/account-shell";
import { useLocale } from "@/components/locale";
import { durationLabel } from "@/components/packages";
import { RenewButton, StatusBanner, useStatusText } from "@/components/subscription-status";
import { Card, LinkButton, Spinner, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api/client";
import { useQuery } from "@/lib/api/hooks";
import { currentOf, daysUntil } from "@/lib/format";

export default function SubscriptionPage() {
  return <AccountShell>{() => <Subscription />}</AccountShell>;
}

function Subscription() {
  const { t, l, date, price } = useLocale();
  const statusText = useStatusText();
  const { data: subs } = useQuery(() => api.subscriptions.list(), [], 3000);
  const { data: packages } = useQuery(() => api.catalog.packages());
  if (!subs || !packages) return <div className="grid place-items-center py-20 text-muted"><Spinner /></div>;

  const sub = currentOf(subs);
  const pkg = packages.find((p) => p.slug === sub?.packageSlug);
  if (!sub || !pkg)
    return (
      <Card className="text-center">
        <h2 className="text-xl font-bold text-fg">{t.account.noSub}</h2>
        <LinkButton href="/packages" className="mt-5">{t.home.ctaPackages}</LinkButton>
      </Card>
    );

  const canRenew = sub.status === "ACTIVE" || sub.status === "EXPIRED";
  return (
    <div className="space-y-6">
      <StatusBanner sub={sub} />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-fg">{l(pkg.name)}</h2>
            <p className="text-sm text-muted">{durationLabel(pkg.durationDays, t)} · {pkg.channelCount}+ {t.pkg.channels} · {pkg.quality}</p>
          </div>
          <StatusBadge status={sub.status} />
        </div>
        <p className="mt-4 text-fg">{statusText(sub)}</p>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <Item k={t.sub.id} v={<span dir="ltr" className="font-mono">{sub.id}</span>} />
          <Item k={t.sub.start} v={sub.startsAt ? date(sub.startsAt) : "—"} />
          <Item k={t.account.expiry} v={sub.endsAt ? `${date(sub.endsAt)} (${daysUntil(sub.endsAt)} ${t.account.days})` : "—"} />
          <Item k={t.pkg.devices} v={pkg.maxDevices} />
          <Item k={t.pkg.streams} v={pkg.maxStreams} />
          <Item k={t.pkg.deviceSwaps} v={`${pkg.maxDeviceSwaps - sub.deviceSwapsUsed} / ${pkg.maxDeviceSwaps}`} />
        </dl>
        {canRenew && (
          <div className="mt-6 space-y-3 border-t border-line pt-5">
            <p className="text-sm text-muted">{t.sub.renewNote}</p>
            <RenewButton sub={sub} label={`${t.sub.renewFor} ${price(pkg.price)}`} />
          </div>
        )}
        <p className="mt-5 text-xs text-muted">{t.sub.reminders}</p>
      </Card>


      {subs.length > 1 && (
        <Card>
          <h3 className="mb-3 font-bold text-fg">{t.sub.history}</h3>
          <ul className="divide-y divide-line text-sm">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-fg">
                  {l(packages.find((p) => p.slug === s.packageSlug)?.name ?? { ar: s.packageSlug, en: s.packageSlug })}{" "}
                  <span className="font-mono text-xs text-muted" dir="ltr">{s.id}</span>
                </span>
                <span className="flex items-center gap-3 text-muted">{date(s.createdAt)} <StatusBadge status={s.status} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

const Item = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div>
    <dt className="text-muted">{k}</dt>
    <dd className="mt-0.5 font-semibold text-fg">{v}</dd>
  </div>
);
