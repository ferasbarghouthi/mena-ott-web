"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Me } from "@/lib/api/types";
import { RequireAuth } from "./auth-shell";
import { useLocale } from "./locale";
import { cx, L } from "./ui";

export function AccountShell({ children }: { children: (me: Me) => ReactNode }) {
  const { t, href } = useLocale();
  const pathname = usePathname().replace(/\/$/, "");
  const tabs = [
    ["/account", t.account.overview],
    ["/account/subscription", t.account.subscription],
    ["/account/devices", t.account.devices],
    ["/account/payments", t.account.payments],
    ["/account/profile", t.account.profile],
  ] as const;
  return (
    <RequireAuth>
      {(me) => (
        <div className="py-10">
          <p className="text-sm text-muted">{t.account.hello} {me.name}</p>
          <h1 className="mt-1 text-3xl font-bold text-fg">{t.account.title}</h1>
          <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line" aria-label={t.account.title}>
            {tabs.map(([p, label]) => (
              <L
                key={p}
                href={p}
                className={cx("-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition", pathname === href(p) ? "border-brand text-fg" : "border-transparent text-muted hover:text-fg")}
              >
                {label}
              </L>
            ))}
          </nav>
          <div className="mt-8">{children(me)}</div>
        </div>
      )}
    </RequireAuth>
  );
}
