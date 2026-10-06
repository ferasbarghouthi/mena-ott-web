"use client";

import { AccountShell } from "@/components/account-shell";
import { useLocale } from "@/components/locale";
import { Card, Spinner, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api/client";
import { useQuery } from "@/lib/api/hooks";
import type { Payment } from "@/lib/api/types";
import { BRAND } from "@/lib/i18n";

export default function PaymentsPage() {
  return <AccountShell>{() => <Payments />}</AccountShell>;
}

function Payments() {
  const { t, date, price, locale } = useLocale();
  const { data: payments } = useQuery(() => api.payments.list());
  if (!payments) return <div className="grid place-items-center py-20 text-muted"><Spinner /></div>;

  // The real API returns a PDF; the mock prints a simple invoice page instead.
  const invoice = (p: Payment) => {
    const url = api.payments.invoiceUrl(p.id);
    if (url) return window.open(url, "_blank", "noopener");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html dir="${locale === "ar" ? "rtl" : "ltr"}"><title>${p.id}</title><body style="font-family:sans-serif;padding:40px">` +
        `<h1>${BRAND[locale]}</h1><p>${t.payments.invoice}: ${p.id}</p><p>${t.payments.date}: ${date(p.date)}</p>` +
        `<p>${t.payments.description}: ${p.description}</p><p><b>${t.payments.amount}: ${price(p)}</b> (${t.pkg.taxIncl})</p>` +
        `<script>print()</script></body></html>`,
    );
  };

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-fg">{t.payments.title}</h2>
      {payments.length === 0 ? (
        <p className="text-muted">{t.payments.none}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-2 text-start font-medium">{t.payments.date}</th>
                <th className="pb-2 text-start font-medium">{t.payments.description}</th>
                <th className="pb-2 text-start font-medium">{t.payments.amount}</th>
                <th className="pb-2 text-start font-medium">{t.payments.status}</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-3 text-fg">{date(p.date)}</td>
                  <td className="py-3 text-muted"><span dir="ltr">{p.description}</span> <span className="font-mono text-xs" dir="ltr">{p.id}</span></td>
                  <td className="py-3 text-fg">{price(p)}</td>
                  <td className="py-3"><StatusBadge status={p.status} kind="payment" /></td>
                  <td className="py-3 text-end">
                    {p.status === "SUCCESSFUL" && <button className="text-sm font-semibold text-brand" onClick={() => invoice(p)}>{t.payments.invoice}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
