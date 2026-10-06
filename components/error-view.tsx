"use client";

import { useLocale } from "./locale";
import { LinkButton } from "./ui";

export function ErrorView({ kind }: { kind: "notFound" | "server" | "maintenance" }) {
  const { t } = useLocale();
  const [title, sub, code] =
    kind === "notFound" ? [t.errors.notFoundTitle, t.errors.notFoundSub, "404"] : kind === "server" ? [t.errors.serverTitle, t.errors.serverSub, "500"] : [t.errors.maintenanceTitle, t.errors.maintenanceSub, "🛠"];
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="bg-gradient-to-r from-brand to-accent bg-clip-text text-6xl font-extrabold text-transparent">{code}</p>
      <h1 className="mt-4 text-2xl font-bold text-fg">{title}</h1>
      <p className="mt-2 text-muted">{sub}</p>
      <div className="mt-8 flex justify-center gap-3">
        {kind !== "maintenance" && <LinkButton href="/">{t.errors.home}</LinkButton>}
        <LinkButton href="/support" variant="secondary">{t.errors.support}</LinkButton>
      </div>
    </div>
  );
}
