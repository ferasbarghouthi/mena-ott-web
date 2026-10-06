"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { useLocale } from "./locale";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");
export { cx };

type Variant = "primary" | "secondary" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-600 shadow-sm",
  secondary: "bg-surface-2 text-fg border border-line hover:border-brand/50",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-red-600/10 text-red-500 hover:bg-red-600/20",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function Button({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...p} className={cx(base, variants[variant], className)} />;
}

export function LinkButton({ href, variant = "primary", className, children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  const { href: h } = useLocale();
  return (
    <Link href={h(href)} className={cx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

export function L({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const { href: h } = useLocale();
  return (
    <Link href={h(href)} className={className}>
      {children}
    </Link>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-2xl border border-line bg-surface p-5 sm:p-6", className)}>{children}</div>;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
      {error ? <span className="block text-xs text-red-500">{error}</span> : hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
export function Input(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cx(inputCls, p.className)} />;
}
export function Select(p: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cx(inputCls, p.className)} />;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cx(inputCls, "min-h-28", p.className)} />;
}

const tone: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-500",
  SUCCESSFUL: "bg-emerald-500/15 text-emerald-500",
  PENDING: "bg-amber-500/15 text-amber-500",
  PENDING_ACTIVATION: "bg-amber-500/15 text-amber-500",
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-500",
  PENDING_DEVICE: "bg-sky-500/15 text-sky-500",
  INITIATED: "bg-sky-500/15 text-sky-500",
  REFUNDED: "bg-slate-500/15 text-muted",
  CANCELLED: "bg-slate-500/15 text-muted",
  EXPIRED: "bg-slate-500/15 text-muted",
};
export function StatusBadge({ status, kind = "sub" }: { status: string; kind?: "sub" | "device" | "payment" }) {
  const { t } = useLocale();
  const map = (kind === "sub" ? t.status.badge : kind === "device" ? t.devices.statuses : t.payments.statuses) as Record<string, string>;
  const label = map[status] ?? status;
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", tone[status] ?? "bg-red-500/15 text-red-500")}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
    </div>
  );
}

export function Notice({ tone: t = "info", children }: { tone?: "info" | "warn" | "error" | "ok"; children: ReactNode }) {
  const map = {
    info: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    error: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
    ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };
  return <div className={cx("rounded-xl border px-4 py-3 text-sm", map[t])}>{children}</div>;
}

export function Spinner() {
  return <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}
