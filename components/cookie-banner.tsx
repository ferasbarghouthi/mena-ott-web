"use client";

import { useEffect, useState } from "react";
import { CONSENT_KEY } from "@/lib/analytics";
import { useLocale } from "./locale";
import { Button } from "./ui";

export function CookieBanner() {
  const { t } = useLocale();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem(CONSENT_KEY));
    } catch {
      /* storage blocked: don't nag */
    }
  }, []);
  if (!show) return null;
  const choose = (v: "all" | "necessary") => {
    try {
      localStorage.setItem(CONSENT_KEY, v);
    } catch {
      /* ignore */
    }
    setShow(false);
  };
  return (
    <div role="dialog" aria-live="polite" className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-2xl sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-fg">{t.cookies.text}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => choose("necessary")}>{t.cookies.reject}</Button>
          <Button onClick={() => choose("all")}>{t.cookies.accept}</Button>
        </div>
      </div>
    </div>
  );
}
