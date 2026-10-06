"use client";

/** Sends the browser to the payment page: the mock's local route, or the gateway's hosted page. */
export function goToPayment(paymentUrl: string, href: (p: string) => string, push: (u: string) => void) {
  if (paymentUrl.startsWith("/")) push(href(paymentUrl));
  else window.location.assign(paymentUrl);
}
