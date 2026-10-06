// Shapes returned by the backend REST API (/api/v1, PRD v1.1 §16-17).

export type Locale = "ar" | "en";
export type L10n = Record<Locale, string>;
export type Currency = "JOD" | "SAR" | "AED" | "USD";

export type Price = {
  amountMinor: number; // tax-inclusive, in minor units (JOD x1000, others x100)
  taxMinor: number;
  taxRate: number;
  currency: Currency;
};

export type Package = {
  slug: string;
  name: L10n;
  description: L10n;
  durationDays: number;
  maxDevices: number;
  maxStreams: number;
  maxDeviceSwaps: number;
  channelCount: number;
  quality: "HD" | "FHD" | "4K";
  vod: boolean;
  featured: boolean;
  features: L10n[];
  price: Price;
};

export type Category = { id: string; name: L10n };
export type Country = { id: string; name: L10n; channelCount?: number };

export type Channel = {
  id: string;
  name: L10n;
  country: string;
  category: string;
  language: "ar" | "en";
  packages: string[]; // package slugs that include it
  now?: { title: L10n; start: string; end: string };
  next?: { title: L10n };
};

export type SubscriptionStatus =
  | "PENDING_PAYMENT"
  | "PENDING_DEVICE"
  | "PENDING_ACTIVATION"
  | "ACTIVE"
  | "ACTIVATION_FAILED"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED";

export type Subscription = {
  id: string;
  packageSlug: string;
  status: SubscriptionStatus;
  startsAt?: string;
  endsAt?: string;
  deviceSwapsUsed: number;
  createdAt: string;
};

export type DeviceStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "EXPIRED" | "BLOCKED" | "REMOVED";
export type Platform = "android_tv" | "google_tv" | "tizen" | "webos" | "android" | "ios" | "web";

export type Device = {
  id: string;
  name: string;
  platform: Platform;
  model: string;
  status: DeviceStatus;
  lastSeenAt: string;
  subscriptionId?: string;
};

export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "FAILED" | "CANCELLED";
export type Order = {
  id: string;
  kind: "new" | "renewal";
  packageSlug: string;
  subscriptionId?: string;
  pairingCode?: string;
  price: Price;
  status: OrderStatus;
  createdAt: string;
};

export type PaymentStatus = "INITIATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED" | "CANCELLED";
export type Payment = {
  id: string;
  orderId: string;
  date: string;
  amountMinor: number;
  currency: Currency;
  status: PaymentStatus;
  description: string;
};

export type Consent = { document: "terms" | "privacy" | "refund"; version: string; acceptedAt: string };
export type Me = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  mobileVerified: boolean;
  market: string;
  consents: Consent[];
};

/** Error codes the API returns alongside message_ar / message_en (PRD §16). */
export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "INVALID_OTP"
  | "PAIRING_CODE_INVALID"
  | "PAIRING_CODE_EXPIRED"
  | "DEVICE_LIMIT_REACHED"
  | "DEVICE_SWAPS_EXHAUSTED"
  | "NO_ELIGIBLE_SUBSCRIPTION"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "PAYMENT_ATTEMPT_PENDING"
  | "ATTACHMENT_INVALID";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public messageAr?: string,
    public messageEn?: string,
  ) {
    super(code);
  }
}
