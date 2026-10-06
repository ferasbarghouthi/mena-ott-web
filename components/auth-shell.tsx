"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useMe } from "@/lib/api/hooks";
import type { Me } from "@/lib/api/types";
import { useLocale } from "./locale";
import { Card, Spinner } from "./ui";

export function AuthShell({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md py-14">
      <Card className="p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-fg">{title}</h1>
        {children}
      </Card>
      {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}

/** Where to go after auth: the ?next= path if it is a local path, else the fallback. */
export function nextPath(fallback: string) {
  if (typeof window === "undefined") return fallback;
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

/** Renders children only for a logged-in customer; otherwise sends them to login and back here. */
export function RequireAuth({ children }: { children: (me: Me) => ReactNode }) {
  const { href } = useLocale();
  const { data: me, loading } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && !me) router.replace(`${href("/login")}?next=${encodeURIComponent(pathname + window.location.search)}`);
  }, [loading, me, router, href, pathname]);
  if (!me)
    return (
      <div className="grid place-items-center py-32 text-muted">
        <Spinner />
      </div>
    );
  return <>{children(me)}</>;
}
