# goBlink Next.js Example

Full working Next.js App Router example with goBlink Merchant SDK.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.local.example .env.local
   ```

3. Run the dev server:
   ```bash
   pnpm dev
   ```

## What's Included

- **`app/page.tsx`** — Checkout page with `PayButton` and `PaymentStatus` React components
- **`app/api/payments/route.ts`** — Create and list payments API route
- **`app/api/webhooks/goblink/route.ts`** — Webhook handler with `createWebhookHandler`
