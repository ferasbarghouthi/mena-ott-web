// In-browser mock of the customer API (PRD v1.1 §16), persisted in
// localStorage. Used only when NEXT_PUBLIC_API_URL is not set. It follows the
// backend's rules so the UI can be exercised end to end:
// - a subscription is ACTIVE only after payment AND provider activation (§2);
// - payment success arrives through the (simulated) gateway webhook, never
//   from the browser redirect;
// - pairing codes are XXXX-XXXX without 0/O/1/I, single use.
//
// Demo codes: EEEE-xxxx = expired code, FFFF-xxxx = provider activation fails.

import { ApiError, type Consent, type Device, type Me, type Order, type Payment, type Platform, type Subscription } from "../types";
import { packageDef, priceFor } from "./catalog";

type Ticket = { id: string; category: string; description: string; subscriptionId?: string; deviceId?: string; createdAt: string };
type DeviceRow = Device & { activateAt?: number };
type SubRow = Subscription & { activateAt?: number; failActivation?: boolean };
type State = {
  me: Me | null;
  pendingOtp?: { mobile: string; purpose: "verify" | "login" };
  orders: Order[];
  subscriptions: SubRow[];
  devices: DeviceRow[];
  payments: Payment[];
  tickets: Ticket[];
};

const KEY = "ott-mock-v2";
const EMPTY: State = { me: null, orders: [], subscriptions: [], devices: [], payments: [], tickets: [] };
const ACTIVATION_MS = 3500;
export const CONSENT_VERSION = "2026-10-06";

let mem: State | null = null;
function load(): State {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(KEY);
    mem = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    mem = { ...EMPTY };
  }
  return mem!;
}
function save(s: State) {
  mem = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* in-memory only */
  }
}

const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const nowIso = () => new Date().toISOString();
const addDays = (iso: string | number, d: number) => new Date(new Date(iso).getTime() + d * 86400000).toISOString();

/** Advance time-based state: activations finishing, subscriptions expiring. */
function tick(s: State): State {
  const now = Date.now();
  const subscriptions = s.subscriptions.map((sub) => {
    if (sub.status === "PENDING_ACTIVATION" && sub.activateAt && now >= sub.activateAt) {
      if (sub.failActivation) return { ...sub, status: "ACTIVATION_FAILED" as const, activateAt: undefined };
      const pkg = packageDef(sub.packageSlug)!;
      const startsAt = sub.startsAt ?? nowIso();
      return { ...sub, status: "ACTIVE" as const, startsAt, endsAt: sub.endsAt ?? addDays(startsAt, pkg.durationDays), activateAt: undefined };
    }
    if (sub.status === "ACTIVE" && sub.endsAt && now > new Date(sub.endsAt).getTime()) return { ...sub, status: "EXPIRED" as const };
    return sub;
  });
  const devices = s.devices.map((d) => {
    const sub = subscriptions.find((x) => x.id === d.subscriptionId);
    if (d.status === "PENDING" && d.activateAt && now >= d.activateAt && sub?.status === "ACTIVE") return { ...d, status: "ACTIVE" as const, activateAt: undefined };
    if (d.status === "ACTIVE" && sub?.status === "EXPIRED") return { ...d, status: "EXPIRED" as const };
    return d;
  });
  return { ...s, subscriptions, devices };
}

function read(): State {
  const s = tick(load());
  save(s);
  return s;
}
function requireMe(s: State) {
  if (!s.me) throw new ApiError("UNAUTHENTICATED");
  return s.me;
}

// ---- auth --------------------------------------------------------------

export async function register(input: { name: string; email: string; mobile: string; password: string; consents: Consent["document"][] }) {
  await wait();
  const consents = input.consents.map((document) => ({ document, version: CONSENT_VERSION, acceptedAt: nowIso() }));
  save({
    ...EMPTY,
    me: { id: rid("U"), name: input.name, email: input.email, mobile: input.mobile, mobileVerified: false, market: "JO", consents },
    pendingOtp: { mobile: input.mobile, purpose: "verify" },
  });
}

export async function otpSend(mobile: string, purpose: "verify" | "login") {
  await wait();
  save({ ...load(), pendingOtp: { mobile, purpose } });
}

/** Demo OTP is always 123456. */
export async function otpVerify(code: string) {
  await wait();
  const s = load();
  if (code !== "123456" || !s.pendingOtp) throw new ApiError("INVALID_OTP");
  const { mobile, purpose } = s.pendingOtp;
  if (purpose === "verify" && s.me) return save({ ...s, me: { ...s.me, mobileVerified: true }, pendingOtp: undefined });
  const me: Me = s.me && s.me.mobile === mobile ? s.me : { id: rid("U"), name: mobile, email: "", mobile, mobileVerified: true, market: "JO", consents: [] };
  save({ ...(s.me?.mobile === mobile ? s : EMPTY), me: { ...me, mobileVerified: true }, pendingOtp: undefined });
}

export async function login(identifier: string, password: string) {
  await wait();
  if (password.length < 8) throw new ApiError("INVALID_CREDENTIALS");
  const s = load();
  if (s.me && (s.me.email === identifier || s.me.mobile === identifier)) return;
  const isEmail = identifier.includes("@");
  save({
    ...EMPTY,
    me: { id: rid("U"), name: isEmail ? identifier.split("@")[0] : identifier, email: isEmail ? identifier : "", mobile: isEmail ? "" : identifier, mobileVerified: !isEmail, market: "JO", consents: [] },
  });
}

export async function loginDemo() {
  await wait();
  const now = Date.now();
  save({
    me: { id: "U-10231", name: "Feras", email: "demo@example.com", mobile: "+962790000000", mobileVerified: true, market: "JO", consents: [] },
    orders: [],
    subscriptions: [
      { id: "SUB-10231", packageSlug: "premium", status: "ACTIVE", startsAt: addDays(now, -340), endsAt: addDays(now, 25), deviceSwapsUsed: 1, createdAt: addDays(now, -340) },
    ],
    devices: [
      { id: "DEV-AABBCC", name: "Living room TV", platform: "android_tv", model: "Sony Bravia XR", status: "ACTIVE", lastSeenAt: addDays(now, -0.05), subscriptionId: "SUB-10231" },
    ],
    payments: [
      { id: "PAY-88120", orderId: "ORD-88120", date: addDays(now, -340), amountMinor: 45000, currency: "JOD", status: "SUCCESSFUL", description: "Premium 365d" },
      { id: "PAY-88004", orderId: "ORD-88120", date: addDays(now, -340.01), amountMinor: 45000, currency: "JOD", status: "FAILED", description: "Premium 365d" },
    ],
    tickets: [],
  });
}

export async function logout() {
  await wait(100);
  save({ ...load(), me: null });
}
export async function logoutAll() {
  await wait();
}
export async function passwordForgot(_identifier: string) {
  await wait(); // always succeeds: never reveal whether an account exists
}
export async function passwordReset(_token: string, password: string) {
  await wait();
  if (password.length < 8) throw new ApiError("INVALID_CREDENTIALS");
}

export async function getMe() {
  return read().me;
}
export async function patchMe(p: Partial<Pick<Me, "name" | "email" | "mobile">>) {
  await wait();
  const s = load();
  const me = requireMe(s);
  save({ ...s, me: { ...me, ...p, mobileVerified: p.mobile && p.mobile !== me.mobile ? false : me.mobileVerified } });
}

// ---- pairing codes -----------------------------------------------------

const CODE_RE = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
const PLATFORMS: [Platform, string][] = [
  ["android_tv", "Android TV"],
  ["tizen", "Samsung TV"],
  ["webos", "LG TV"],
  ["google_tv", "Google TV"],
];

function checkCode(code: string) {
  if (!CODE_RE.test(code)) throw new ApiError("PAIRING_CODE_INVALID");
  if (code.startsWith("EEEE")) throw new ApiError("PAIRING_CODE_EXPIRED");
}
function deviceFromCode(code: string, subscriptionId: string): DeviceRow {
  const [platform, label] = PLATFORMS[code.charCodeAt(5) % PLATFORMS.length];
  return { id: rid("DEV"), name: label, platform, model: label, status: "PENDING", lastSeenAt: nowIso(), subscriptionId, activateAt: Date.now() + ACTIVATION_MS };
}
const liveDevices = (s: State, subId: string) => s.devices.filter((d) => d.subscriptionId === subId && (d.status === "ACTIVE" || d.status === "PENDING"));

// ---- orders and the hosted payment page --------------------------------

export async function createOrder(input: { packageSlug: string; pairingCode?: string; subscriptionId?: string }) {
  await wait();
  const s = read();
  const me = requireMe(s);
  if (!packageDef(input.packageSlug)) throw new ApiError("NOT_FOUND");
  if (input.pairingCode) checkCode(input.pairingCode);
  const order: Order = {
    id: rid("ORD"),
    kind: input.subscriptionId ? "renewal" : "new",
    packageSlug: input.packageSlug,
    subscriptionId: input.subscriptionId,
    pairingCode: input.pairingCode,
    price: priceFor(input.packageSlug, me.market), // frozen at purchase time
    status: "PENDING_PAYMENT",
    createdAt: nowIso(),
  };
  save({ ...s, orders: [order, ...s.orders] });
  return { order, paymentUrl: `/pay/mock?order=${order.id}` };
}

export async function getOrder(id: string) {
  await wait(150);
  const s = read();
  requireMe(s);
  const order = s.orders.find((o) => o.id === id);
  if (!order) throw new ApiError("NOT_FOUND");
  return { order, subscription: s.subscriptions.find((x) => x.id === order.subscriptionId) as Subscription | undefined };
}

/** POST /orders/{id}/payment-attempts: a new attempt on the same order at the same price. */
const attempts = new Map<string, string>(); // idempotency key -> order id
export async function createPaymentAttempt(orderId: string, idempotencyKey: string) {
  await wait();
  const s = read();
  requireMe(s);
  const order = s.orders.find((o) => o.id === orderId);
  if (!order || order.status === "PAID" || order.status === "CANCELLED") throw new ApiError("NOT_FOUND");
  // Refused while an earlier attempt is still pending (no FAILED result for it yet), unless it's the same request again.
  if (order.status === "PENDING_PAYMENT" && attempts.get(idempotencyKey) !== orderId) throw new ApiError("PAYMENT_ATTEMPT_PENDING");
  attempts.set(idempotencyKey, orderId);
  save({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: "PENDING_PAYMENT" } : o)) });
  return { order: { ...order, status: "PENDING_PAYMENT" as const }, paymentUrl: `/pay/mock?order=${orderId}` };
}

/** Simulates the gateway's signed webhook (POST /webhooks/payments). Idempotent. */
export async function simulateGatewayWebhook(orderId: string, success: boolean) {
  await wait(600);
  const s = read();
  const order = s.orders.find((o) => o.id === orderId);
  // A failed attempt can be retried on the same order; a paid one never charges twice.
  if (!order || order.status === "PAID" || order.status === "CANCELLED") return;
  const pkg = packageDef(order.packageSlug)!;
  const payment: Payment = {
    id: rid("PAY"),
    orderId,
    date: nowIso(),
    amountMinor: order.price.amountMinor,
    currency: order.price.currency,
    status: success ? "SUCCESSFUL" : "FAILED",
    description: `${order.kind === "renewal" ? "Renewal " : ""}${pkg.name.en} ${pkg.durationDays}d`,
  };
  if (!success) return save({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: "FAILED" } : o)), payments: [payment, ...s.payments] });

  const newSubId = order.subscriptionId ?? `SUB-${order.id.slice(4)}`;
  const orders = s.orders.map((o) => (o.id === orderId ? { ...o, status: "PAID" as const, subscriptionId: newSubId } : o));
  let { subscriptions, devices } = s;

  if (order.kind === "renewal") {
    // Duration goes on top of ends_at while active, else from today.
    subscriptions = subscriptions.map((x) => {
      if (x.id !== order.subscriptionId) return x;
      const from = x.status === "ACTIVE" && x.endsAt ? x.endsAt : nowIso();
      return { ...x, status: "ACTIVE", startsAt: x.status === "ACTIVE" ? x.startsAt : nowIso(), endsAt: addDays(from, pkg.durationDays) };
    });
    devices = devices.map((d) => (d.subscriptionId === order.subscriptionId && d.status === "EXPIRED" ? { ...d, status: "ACTIVE" } : d));
  } else {
    const subId = newSubId;
    const code = order.pairingCode;
    const sub: SubRow = {
      id: subId,
      packageSlug: order.packageSlug,
      status: code ? "PENDING_ACTIVATION" : "PENDING_DEVICE",
      deviceSwapsUsed: 0,
      createdAt: nowIso(),
      activateAt: code ? Date.now() + ACTIVATION_MS : undefined,
      failActivation: code?.startsWith("FFFF"),
    };
    subscriptions = [...subscriptions, sub];
    if (code) devices = [...devices, deviceFromCode(code, subId)];
  }
  save({ ...s, orders, subscriptions, devices, payments: [payment, ...s.payments] });
}

// ---- subscriptions, devices, payments, support --------------------------

export async function listSubscriptions() {
  await wait(120);
  const s = read();
  requireMe(s);
  return [...s.subscriptions].reverse() as Subscription[];
}

export async function renewSubscription(id: string) {
  const s = read();
  const sub = s.subscriptions.find((x) => x.id === id);
  if (!sub) throw new ApiError("NOT_FOUND");
  return createOrder({ packageSlug: sub.packageSlug, subscriptionId: id });
}

export async function listDevices() {
  await wait(120);
  const s = read();
  requireMe(s);
  return s.devices.filter((d) => d.status !== "REMOVED") as Device[];
}

export async function pairDevice(code: string, subscriptionId: string) {
  await wait(600);
  const s = read();
  requireMe(s);
  checkCode(code);
  const sub = s.subscriptions.find((x) => x.id === subscriptionId);
  if (!sub || !["ACTIVE", "PENDING_DEVICE"].includes(sub.status)) throw new ApiError("NO_ELIGIBLE_SUBSCRIPTION");
  const pkg = packageDef(sub.packageSlug)!;
  if (liveDevices(s, sub.id).length >= pkg.maxDevices) throw new ApiError("DEVICE_LIMIT_REACHED");
  const subscriptions = s.subscriptions.map((x) =>
    x.id === sub.id && x.status === "PENDING_DEVICE"
      ? { ...x, status: "PENDING_ACTIVATION" as const, activateAt: Date.now() + ACTIVATION_MS, failActivation: code.startsWith("FFFF") }
      : x,
  );
  save({ ...s, subscriptions, devices: [...s.devices, deviceFromCode(code, sub.id)] });
}

export async function replaceDevice(deviceId: string, code: string) {
  await wait(600);
  const s = read();
  requireMe(s);
  checkCode(code);
  const old = s.devices.find((d) => d.id === deviceId);
  const sub = s.subscriptions.find((x) => x.id === old?.subscriptionId);
  if (!old || !sub) throw new ApiError("NOT_FOUND");
  const pkg = packageDef(sub.packageSlug)!;
  if (sub.deviceSwapsUsed >= pkg.maxDeviceSwaps) throw new ApiError("DEVICE_SWAPS_EXHAUSTED");
  save({
    ...s,
    devices: [...s.devices.map((d) => (d.id === deviceId ? { ...d, status: "REMOVED" as const } : d)), deviceFromCode(code, sub.id)],
    subscriptions: s.subscriptions.map((x) => (x.id === sub.id ? { ...x, deviceSwapsUsed: x.deviceSwapsUsed + 1 } : x)),
  });
}

export async function renameDevice(id: string, name: string) {
  await wait(200);
  const s = load();
  save({ ...s, devices: s.devices.map((d) => (d.id === id ? { ...d, name } : d)) });
}

export async function removeDevice(id: string) {
  await wait(300);
  const s = load();
  save({ ...s, devices: s.devices.map((d) => (d.id === id ? { ...d, status: "REMOVED" } : d)) });
}

export async function listPayments() {
  await wait(120);
  const s = read();
  requireMe(s);
  return s.payments;
}

export const ATTACHMENT_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

/** POST /support/attachments (multipart). The mock checks type and size and keeps nothing. */
export async function uploadAttachment(file: File) {
  await wait(400);
  if (!ATTACHMENT_TYPES.includes(file.type) || file.size > ATTACHMENT_MAX_BYTES) throw new ApiError("ATTACHMENT_INVALID");
  return { attachment_id: rid("ATT") };
}

export async function createSupportRequest(t: Omit<Ticket, "id" | "createdAt"> & { contact?: string; attachment_ids?: string[] }) {
  await wait(500);
  const s = load();
  const ticket: Ticket = { ...t, id: rid("TCK"), createdAt: nowIso() };
  save({ ...s, tickets: [ticket, ...s.tickets] });
  return { id: ticket.id };
}
