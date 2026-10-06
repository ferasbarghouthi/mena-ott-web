// The only way pages get data. With NEXT_PUBLIC_API_URL set it calls the
// real backend (/api/v1, PRD v1.1 §16); otherwise it uses the mocks, so no
// price, package or channel is ever hard-coded in a page.

import * as catalog from "./mock/catalog";
import * as db from "./mock/db";
import { ApiError, type Category, type Channel, type Consent, type Country, type Device, type Me, type Order, type Package, type Payment, type Subscription } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const USING_MOCK = !BASE;

/** Market of an anonymous visitor; the backend derives it from IP/account. MVP has JO only. */
export const DEFAULT_MARKET = "JO";

type Json = Record<string, unknown> | unknown[];
async function http<T>(method: string, path: string, body?: Json | FormData, headers: Record<string, string> = {}): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: body && !isForm ? { "Content-Type": "application/json", ...headers } : headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new ApiError(e.code ?? "NOT_FOUND", e.message_ar, e.message_en);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const listeners = new Set<() => void>();
export const onInvalidate = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
/** Re-run every mounted query after a mutation. */
export const invalidate = () => listeners.forEach((l) => l());
const mut = <A extends unknown[], R>(fn: (...a: A) => Promise<R>) => async (...a: A) => {
  const r = await fn(...a);
  invalidate();
  return r;
};

export const api = {
  catalog: {
    packages: (market = DEFAULT_MARKET): Promise<Package[]> =>
      BASE ? http("GET", `/catalog/packages?market=${market}`) : Promise.resolve(catalog.packagesFor(market)),
    package: async (slug: string, market = DEFAULT_MARKET): Promise<{ package: Package; channels: Channel[] } | null> => {
      if (BASE) return http("GET", `/catalog/packages/${slug}?market=${market}`);
      const p = catalog.packagesFor(market).find((x) => x.slug === slug);
      return p ? { package: p, channels: catalog.CHANNELS.filter((c) => c.packages.includes(slug)) } : null;
    },
    channels: (q: { country?: string; category?: string; q?: string } = {}): Promise<Channel[]> => {
      if (BASE) return http("GET", `/catalog/channels?${new URLSearchParams(q as Record<string, string>)}`);
      const needle = q.q?.toLowerCase();
      return Promise.resolve(
        catalog.CHANNELS.filter(
          (c) =>
            (!q.country || c.country === q.country) &&
            (!q.category || c.category === q.category) &&
            (!needle || `${c.name.ar} ${c.name.en}`.toLowerCase().includes(needle)),
        ),
      );
    },
    categories: (): Promise<Category[]> => (BASE ? http("GET", "/catalog/categories") : Promise.resolve(catalog.CATEGORIES)),
    countries: async (): Promise<Country[]> => {
      if (BASE) {
        const rows = await http<{ code: string; name_ar: string; name_en: string; channel_count: number }[]>("GET", "/catalog/countries");
        return rows.map((r) => ({ id: r.code.toLowerCase(), name: { ar: r.name_ar, en: r.name_en }, channelCount: r.channel_count }));
      }
      return catalog.COUNTRIES.map((c) => ({ ...c, channelCount: catalog.CHANNELS.filter((ch) => ch.country === c.id).length }));
    },
  },

  auth: {
    register: mut((b: { name: string; email: string; mobile: string; password: string; consents: Consent["document"][] }) =>
      BASE ? http<void>("POST", "/auth/register", b) : db.register(b)),
    otpSend: (mobile: string, purpose: "verify" | "login") => (BASE ? http<void>("POST", "/auth/otp/send", { mobile, purpose }) : db.otpSend(mobile, purpose)),
    otpVerify: mut((code: string, mobile?: string) => (BASE ? http<void>("POST", "/auth/otp/verify", { code, mobile }) : db.otpVerify(code))),
    login: mut((identifier: string, password: string) => (BASE ? http<void>("POST", "/auth/login", { identifier, password }) : db.login(identifier, password))),
    loginDemo: mut(() => db.loginDemo()),
    logout: mut(() => (BASE ? http<void>("POST", "/auth/logout") : db.logout())),
    logoutAll: () => (BASE ? http<void>("POST", "/auth/logout-all") : db.logoutAll()),
    passwordForgot: (identifier: string) => (BASE ? http<void>("POST", "/auth/password/forgot", { identifier }) : db.passwordForgot(identifier)),
    passwordReset: (token: string, password: string) => (BASE ? http<void>("POST", "/auth/password/reset", { token, password }) : db.passwordReset(token, password)),
  },

  me: {
    get: async (): Promise<Me | null> => {
      if (!BASE) return db.getMe();
      try {
        return await http<Me>("GET", "/me");
      } catch (e) {
        if (e instanceof ApiError && e.code === "UNAUTHENTICATED") return null;
        throw e;
      }
    },
    patch: mut((p: Partial<Pick<Me, "name" | "email" | "mobile">>) => (BASE ? http<void>("PATCH", "/me", p) : db.patchMe(p))),
  },

  orders: {
    /** Returns the hosted payment page URL; card data never reaches our servers. */
    create: mut((b: { packageSlug: string; pairingCode?: string }): Promise<{ order: Order; paymentUrl: string }> =>
      BASE ? http("POST", "/orders", b) : db.createOrder(b)),
    get: (id: string): Promise<{ order: Order; subscription?: Subscription }> => (BASE ? http("GET", `/orders/${id}`) : db.getOrder(id)),
    /** Retry payment on the same order at the same price; refused while an earlier attempt is pending. */
    retryPayment: mut((id: string, idempotencyKey: string): Promise<{ order: Order; paymentUrl: string }> =>
      BASE ? http("POST", `/orders/${id}/payment-attempts`, {}, { "Idempotency-Key": idempotencyKey }) : db.createPaymentAttempt(id, idempotencyKey)),
  },

  subscriptions: {
    list: (): Promise<Subscription[]> => (BASE ? http("GET", "/me/subscriptions") : db.listSubscriptions()),
    renew: mut((id: string): Promise<{ order: Order; paymentUrl: string }> => (BASE ? http("POST", `/me/subscriptions/${id}/renew`) : db.renewSubscription(id))),
  },

  devices: {
    list: (): Promise<Device[]> => (BASE ? http("GET", "/me/devices") : db.listDevices()),
    pair: mut((code: string, subscriptionId: string) => (BASE ? http<void>("POST", "/me/devices/pair", { code, subscriptionId }) : db.pairDevice(code, subscriptionId))),
    replace: mut((id: string, code: string) => (BASE ? http<void>("POST", `/me/devices/${id}/replace`, { code }) : db.replaceDevice(id, code))),
    rename: mut((id: string, name: string) => (BASE ? http<void>("PATCH", `/me/devices/${id}`, { name }) : db.renameDevice(id, name))),
    remove: mut((id: string) => (BASE ? http<void>("DELETE", `/me/devices/${id}`) : db.removeDevice(id))),
  },

  payments: {
    list: (): Promise<Payment[]> => (BASE ? http("GET", "/me/payments") : db.listPayments()),
    invoiceUrl: (id: string) => (BASE ? `${BASE}/api/v1/me/payments/${id}/invoice` : null),
  },

  support: {
    /** PNG, JPEG or WebP up to 5 MB; returns the id to pass in attachment_ids. */
    upload: (file: File): Promise<{ attachment_id: string }> => {
      if (!BASE) return db.uploadAttachment(file);
      const form = new FormData();
      form.append("file", file);
      return http("POST", "/support/attachments", form);
    },
    create: (b: { category: string; description: string; subscriptionId?: string; deviceId?: string; contact?: string; attachment_ids?: string[] }): Promise<{ id: string }> =>
      BASE ? http("POST", "/support/requests", b) : db.createSupportRequest(b),
  },

  /** Mock only: what the gateway's signed webhook would do. */
  mockGateway: { complete: mut((orderId: string, success: boolean) => db.simulateGatewayWebhook(orderId, success)) },
};
