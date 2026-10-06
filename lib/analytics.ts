// Product analytics events from PRD v1.1 §5.1. No PII in properties.
// Events are dropped until the visitor accepts non-essential cookies.

export type AnalyticsEvent = "view_package" | "begin_checkout" | "purchase" | "pair_device" | "activation_failed";

export const CONSENT_KEY = "ott-cookie-consent";

export function track(event: AnalyticsEvent, props: Record<string, string | number> = {}) {
  try {
    if (localStorage.getItem(CONSENT_KEY) !== "all") return;
  } catch {
    return;
  }
  // Wire to the analytics provider here.
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props);
}
