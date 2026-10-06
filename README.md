# MENA OTT customer website

Next.js 16 (App Router) + TypeScript + Tailwind 4. Arabic-first (RTL) with English, routes under `/ar` and `/en`. Built to PRD v1.1 §5 (pages, rules, status texts, flows) and §16 (APIs).

## Run

```bash
npm install
npm run dev        # http://localhost:3000 -> /ar
npm run build && npm start
```

With no `NEXT_PUBLIC_API_URL` the site runs on in-browser mocks (`lib/api/mock`). Set `NEXT_PUBLIC_API_URL=https://api.example.com` to call the real backend at `/api/v1`. `NEXT_PUBLIC_SITE_URL` sets canonical/hreflang URLs.

## Demo data (mock mode)

- "Use demo account" on Login: Premium, 25 days left, one TV.
- OTP is always `123456`.
- Pairing codes: `XXXX-XXXX`, letters A-Z and digits 2-9 without 0/O/1/I. `EEEE-xxxx` = expired code, `FFFF-xxxx` = provider activation fails.
- The payment page at `/pay/mock` stands in for the gateway's hosted page and can simulate a decline.

## Where things live

| Path | What |
| --- | --- |
| `lib/api/client.ts` | The only data access. Each method maps to one §16 endpoint; mock or real by env. |
| `lib/api/mock/` | Catalog (packages, price book in minor units, channels) and customer state with the §2 rules. |
| `lib/i18n.ts` | All UI text, AR + EN, including §5.3 status texts and API error messages. |
| `lib/features.ts` | Phase 2 flags (coupons, upgrade, auto-renew, ticket tracking), off. |
| `lib/content.ts` | FAQ and placeholder legal texts (version + date) until the lawyer's versions. |
| `app/[locale]/…` | Pages. Public catalog pages are server-rendered with hreflang. |

## Routes

`/`, `/packages`, `/packages/{slug}`, `/channels`, `/setup`, `/faq`, `/register`, `/login`, `/forgot-password`, `/reset-password`, `/checkout?package=`, `/checkout/result?order=`, `/activate`, `/account`, `/account/devices`, `/account/subscription`, `/account/payments`, `/account/profile`, `/support`, `/terms`, `/privacy`, `/refund-policy`, `/maintenance`, 404, 500.

Aligned with PRD v1.1 §16: `/catalog/countries` (channel counts in the Channels filter), `/orders/{id}/payment-attempts` (Retry after a declined card, with an Idempotency-Key), and `/support/attachments` (up to 3 PNG/JPEG/WebP images, 5 MB each).

## Not done yet

- Real CAPTCHA and rate limiting (backend/edge); the forms show the placeholder line only.
- QR code on the TV is the app's job; `/activate?code=` accepts it.
- `screenshots/` holds the browser-test captures behind the preview.
