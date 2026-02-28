# Phase G: @goblink/merchant-sdk — Official Merchant SDK

## Context
Create the official goBlink Merchant SDK from scratch in this repo.
This SDK wraps the goBlink Merchant REST API (live at merchant.goblink.io) so developers can accept crypto payments in any JS/TS app in minutes.

## Beta Testers
Warhead (Brett) runs: Voidspace (Next.js App Router + Supabase), GenerateIdeas.app (Next.js App Router + Supabase), Lapphund Designs (Shopify/Etsy). SDK must work perfectly for Next.js App Router apps and also Express, Fastify, plain Node.js.

## The goBlink Merchant API

Base URL: https://merchant.goblink.io/api/v1
Auth: Bearer token with API key (gb_live_xxx or gb_test_xxx)

### Endpoints

POST /payments — Create payment. Body: { amount, currency?, orderId?, returnUrl?, metadata?, expiresInMinutes? }. Returns: { id, amount, currency, status, depositAddress, paymentUrl, orderId, expiresAt, createdAt, isTest, originalAmount?, originalCurrency? }

GET /payments — List payments. Query: status?, orderId?, is_test?, limit? (max 100), offset?. Returns: { data: Payment[], pagination: { total, limit, offset } }

GET /payments/:id — Get payment details with refunds array

POST /payments/:id/refund — Refund. Body: { amount?, reason? }

POST /webhooks — Register webhook. Body: { url, events? }
GET /webhooks — List webhooks
GET /webhooks/:id — Get webhook
DELETE /webhooks/:id — Delete webhook
POST /webhooks/:id/test — Test webhook
POST /webhooks/verify — Verify signature. Body: { payload, signature, secret }

GET /merchant — Get merchant profile

Webhook events: payment.created, payment.processing, payment.confirmed, payment.failed, payment.expired, payment.refunded
Webhook signature: HMAC-SHA256 of JSON payload, header: x-goblink-signature

Supported currencies: USD, CAD, EUR, GBP, AUD, JPY, CHF, SEK, NOK, DKK, NZD, SGD, HKD, KRW, MXN, BRL, INR, TRY, PLN, ZAR

## SDK Design

Package name: @goblink/merchant-sdk
Language: TypeScript strict
Build: tsup (dual ESM + CJS)
Target: Node.js 18+ and modern browsers
Zero runtime dependencies (native fetch)
Package manager: pnpm

### Core API Design

The main class is GoBlink with sub-resources: payments, webhooks, merchant.

GoBlink constructor takes: { apiKey, baseUrl?, timeout?, retries?, onError? }
- baseUrl defaults to https://merchant.goblink.io/api/v1
- timeout defaults to 30000
- retries defaults to 2 for GET requests
- Test mode auto-detected from gb_test_ prefix

goblink.payments.create({ amount, currency?, orderId?, returnUrl?, metadata?, expiresInMinutes? })
goblink.payments.get(id)
goblink.payments.list({ status?, orderId?, isTest?, limit?, offset? })
goblink.payments.refund(id, { amount?, reason? })

goblink.webhooks.create({ url, events? })
goblink.webhooks.list()
goblink.webhooks.get(id)
goblink.webhooks.delete(id)
goblink.webhooks.test(id)

goblink.merchant.get()

GoBlink.verifyWebhookSignature(payload, signature, secret) — static method, no API call

### Webhook Handler Helpers

Export from '@goblink/merchant-sdk/webhooks':
- webhookHandler({ secret, onPaymentConfirmed?, onPaymentFailed?, onPaymentCreated?, onPaymentProcessing?, onPaymentExpired?, onPaymentRefunded? }) — returns Express-compatible middleware

Export from '@goblink/merchant-sdk/nextjs':
- createWebhookHandler({ secret, ... }) — returns Next.js App Router POST handler

### React Components

Export from '@goblink/merchant-sdk/react':
- PayButton component: props = { apiKey, amount, currency?, orderId?, returnUrl?, onSuccess?, onError?, theme?, className?, label? }. Creates a payment via API, opens paymentUrl in new tab or iframe, polls for status.
- PaymentStatus component: props = { paymentId, apiKey, onComplete?, onError?, pollInterval? }. Shows real-time payment status with animated stages.

### CLI Scaffolder

bin/create-goblink-app.ts registered as "create-goblink-app" binary.
- Prompts: framework (Next.js / Express / None), mode (test/live)
- Scaffolds working example with routes, webhook handler, .env, README
- Use readline for prompts, no external deps

### Error Handling

GoBlinkError extends Error with: status, code, details properties.
Throw typed errors for auth failures, validation, not found, rate limits, server errors.

### TypeScript Types

Export all: Payment, Refund, Webhook, Merchant, WebhookEvent, PaymentStatus, Currency, CreatePaymentParams, ListPaymentsParams, CreateWebhookParams, GoBlinkConfig, GoBlinkError

## File Structure

src/index.ts — Main SDK export
src/client.ts — HTTP client (fetch wrapper with retries, auth, errors)
src/types.ts — All interfaces/types
src/errors.ts — GoBlinkError
src/resources/payments.ts
src/resources/webhooks.ts
src/resources/merchant.ts
src/webhooks/index.ts — webhookHandler + verifySignature
src/webhooks/nextjs.ts — createWebhookHandler
src/react/index.ts — component exports
src/react/PayButton.tsx
src/react/PaymentStatus.tsx
bin/create-goblink-app.ts
examples/nextjs/ — Full working Next.js example
examples/express/ — Full working Express example
package.json, tsconfig.json, tsup.config.ts, .gitignore, LICENSE (MIT), README.md

## Build Setup

tsup entry points: src/index.ts, src/webhooks/index.ts, src/webhooks/nextjs.ts, src/react/index.ts
package.json exports map: '.' -> main, './webhooks' -> webhooks, './nextjs' -> nextjs, './react' -> react
peerDependencies: react >= 18 (optional)
publishConfig: registry https://npm.pkg.github.com
files field: dist/, bin/

## README.md
Comprehensive docs: quick start, full API reference, webhook guides (Express + Next.js), React components, CLI scaffolder, TypeScript types, error handling, test mode, examples.

## After Implementation
- pnpm install
- pnpm build (must succeed)
- Commit: "feat: @goblink/merchant-sdk v0.1.0 — full SDK, webhook helpers, React components, CLI scaffolder, docs"
- Push to origin main

When completely finished, run: openclaw system event --text "Done: @goblink/merchant-sdk v0.1.0 shipped" --mode now
