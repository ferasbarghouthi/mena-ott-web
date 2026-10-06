"use client";

import { useState } from "react";
import { FaqList } from "@/components/faq-list";
import { useLocale } from "@/components/locale";
import { Button, Card, cx, Field, Input, L, Notice, PageHeader, Select, Spinner, Textarea } from "@/components/ui";
import { api } from "@/lib/api/client";
import { useMe, useQuery } from "@/lib/api/hooks";
import { currentOf } from "@/lib/format";
import { errorText, SUPPORT_EMAIL } from "@/lib/i18n";

const CATS = ["activation", "payment", "channel", "streaming", "device", "account"] as const;
// Limits from PRD v1.1 §16 (POST /support/attachments, /support/requests).
const ATTACHMENT_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 3;

export default function SupportPage() {
  const { t } = useLocale();
  const { data: me, loading } = useMe();
  const { data: subs } = useQuery(() => (me ? api.subscriptions.list() : Promise.resolve([])), [me?.id]);
  const { data: devices } = useQuery(() => (me ? api.devices.list() : Promise.resolve([])), [me?.id]);
  const sub = subs ? currentOf(subs) : undefined;
  const [category, setCategory] = useState<string>("activation");
  const [description, setDescription] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [contact, setContact] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const pickFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? []);
    if (picked.length > MAX_FILES) return setErr(t.support.tooMany);
    if (picked.some((f) => !ATTACHMENT_TYPES.includes(f.type) || f.size > ATTACHMENT_MAX_BYTES)) return setErr(t.errors.ATTACHMENT_INVALID);
    setErr("");
    setFiles(picked);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return setErr(t.support.errDesc);
    if (!me && !contact.trim()) return setErr(t.support.errContact);
    setErr("");
    setBusy(true);
    try {
      const attachment_ids = (await Promise.all(files.map((f) => api.support.upload(f)))).map((r) => r.attachment_id);
      const r = await api.support.create({
        category,
        description,
        contact: me ? undefined : contact,
        subscriptionId: sub?.id,
        deviceId: deviceId || devices?.[0]?.id,
        attachment_ids: attachment_ids.length ? attachment_ids : undefined,
      });
      setSent(r.id);
      setDescription("");
      setFiles([]);
    } catch (e) {
      setErr(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-12">
      <PageHeader title={t.support.title} sub={t.support.sub} />
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <section>
          <h2 className="mb-4 text-lg font-bold text-fg">{t.faq.title}</h2>
          <FaqList limit={6} />
          <p className="mt-6 text-sm text-muted">{t.support.contactEmail} <span dir="ltr" className="text-fg">{SUPPORT_EMAIL}</span></p>
        </section>
        <Card>
          <h2 className="mb-5 text-lg font-bold text-fg">{t.support.new}</h2>
          {sent ? (
            <div className="space-y-3">
              <Notice tone="ok">{t.support.sent} <b dir="ltr">{sent}</b></Notice>
              <p className="text-sm text-muted">{t.support.sentSub}</p>
              <Button variant="secondary" onClick={() => setSent(null)}>{t.support.new}</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              {!loading && !me && (
                <Notice>{t.support.loginHint} <L href="/login?next=/support" className="font-semibold underline">{t.nav.login}</L></Notice>
              )}
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-fg">{t.support.category}</legend>
                <div className="flex flex-wrap gap-2">
                  {CATS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      aria-pressed={category === c}
                      onClick={() => setCategory(c)}
                      className={cx("rounded-full border px-3.5 py-1.5 text-sm transition", category === c ? "border-brand bg-brand text-white" : "border-line text-muted hover:text-fg")}
                    >
                      {t.support.categories[c]}
                    </button>
                  ))}
                </div>
              </fieldset>
              {!me && (
                <Field label={t.support.contact}><Input value={contact} onChange={(e) => setContact(e.target.value)} dir="ltr" /></Field>
              )}
              {me && devices && devices.length > 0 && (
                <Field label={t.devices.platform} hint={`${t.support.attached}: ${sub ? sub.id : "—"}`}>
                  <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                    {devices.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.model}</option>)}
                  </Select>
                </Field>
              )}
              <Field label={t.support.description}>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Field label={t.support.screenshot} hint={files.length ? files.map((f) => f.name).join("، ") : t.support.screenshotHint}>
                <input
                  type="file"
                  multiple
                  accept={ATTACHMENT_TYPES.join(",")}
                  onChange={(e) => pickFiles(e.target.files)}
                  className="block w-full text-sm text-muted file:me-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-fg"
                />
              </Field>
              {err && <Notice tone="error">{err}</Notice>}
              <Button type="submit" disabled={busy} className="w-full">{busy && <Spinner />}{t.support.submit}</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
