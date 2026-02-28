# @goblink/merchant-sdk

Official goBlink Merchant SDK — accept crypto payments in any JS/TS app in minutes.

## Quick Start

```bash
npm install @goblink/merchant-sdk
```

```typescript
import { GoBlink } from "@goblink/merchant-sdk";

const goblink = new GoBlink({
  apiKey: "gb_test_your_key_here",
});

// Create a payment
const payment = await goblink.payments.create({
  amount: 9.99,
  currency: "USD",
});

console.log(payment.paymentUrl); // Send customer here
```

## Installation

```bash
# npm
npm install @goblink/merchant-sdk

# pnpm
pnpm add @goblink/merchant-sdk

# yarn
yarn add @goblink/merchant-sdk
```

## Configuration

```typescript
import { GoBlink } from "@goblink/merchant-sdk";

const goblink = new GoBlink({
  apiKey: "gb_live_xxx",     // Required. gb_test_ prefix enables test mode
  baseUrl: "https://...",    // Optional. Defaults to https://merchant.goblink.io/api/v1
  timeout: 30000,            // Optional. Request timeout in ms (default: 30000)
  retries: 2,                // Optional. Retry count for GET requests (default: 2)
  onError: (err) => {},      // Optional. Global error handler
});

// Test mode is auto-detected from the API key prefix
console.log(goblink.isTestMode); // true if gb_test_ key
```

## API Reference

### Payments

#### Create a Payment

```typescript
const payment = await goblink.payments.create({
  amount: 29.99,                 // Required. Amount in specified currency
  currency: "USD",               // Optional. Default: USD
  orderId: "order_123",          // Optional. Your internal order ID
  returnUrl: "https://...",      // Optional. Redirect URL after payment
  metadata: { sku: "ITEM_1" },  // Optional. Custom metadata
  expiresInMinutes: 30,          // Optional. Payment expiration
});

// payment.id            — Payment ID
// payment.paymentUrl    — URL to send customer to
// payment.depositAddress — Crypto deposit address
// payment.status        — "pending" | "processing" | "confirmed" | "failed" | "expired" | "refunded"
// payment.expiresAt     — ISO timestamp
```

#### Get a Payment

```typescript
const payment = await goblink.payments.get("pay_abc123");
// Includes payment.refunds[] array
```

#### List Payments

```typescript
const result = await goblink.payments.list({
  status: "confirmed",   // Optional. Filter by status
  orderId: "order_123",  // Optional. Filter by order ID
  isTest: true,          // Optional. Filter test payments
  limit: 50,             // Optional. Max 100 (default: 20)
  offset: 0,             // Optional. Pagination offset
});

// result.data           — Payment[]
// result.pagination     — { total, limit, offset }
```

#### Refund a Payment

```typescript
const refund = await goblink.payments.refund("pay_abc123", {
  amount: 5.00,          // Optional. Partial refund amount (full refund if omitted)
  reason: "Returned",    // Optional. Refund reason
});
```

### Webhooks

#### Create a Webhook

```typescript
const webhook = await goblink.webhooks.create({
  url: "https://example.com/webhooks/goblink",
  events: ["payment.confirmed", "payment.failed"],  // Optional. All events if omitted
});

// webhook.secret — Use this to verify webhook signatures
```

#### List Webhooks

```typescript
const webhooks = await goblink.webhooks.list();
```

#### Get a Webhook

```typescript
const webhook = await goblink.webhooks.get("wh_abc123");
```

#### Delete a Webhook

```typescript
await goblink.webhooks.delete("wh_abc123");
```

#### Test a Webhook

```typescript
const result = await goblink.webhooks.test("wh_abc123");
// result.success — boolean
```

### Merchant

#### Get Merchant Profile

```typescript
const merchant = await goblink.merchant.get();
// merchant.name, merchant.email, merchant.walletAddress, etc.
```

### Verify Webhook Signature

Static method — no API call required:

```typescript
import { GoBlink } from "@goblink/merchant-sdk";

const isValid = GoBlink.verifyWebhookSignature(
  rawBody,       // Raw request body string
  signature,     // x-goblink-signature header
  webhookSecret, // Your webhook secret
);
```

## Webhook Handlers

### Express / Fastify / Node.js

```typescript
import express from "express";
import { webhookHandler } from "@goblink/merchant-sdk/webhooks";

const app = express();

app.post(
  "/webhooks/goblink",
  express.raw({ type: "application/json" }),
  webhookHandler({
    secret: process.env.GOBLINK_WEBHOOK_SECRET!,
    onPaymentConfirmed: async (payment) => {
      // Fulfill the order
      console.log("Paid:", payment.id, payment.amount);
    },
    onPaymentFailed: async (payment) => {
      console.log("Failed:", payment.id);
    },
    onPaymentCreated: async (payment) => { /* ... */ },
    onPaymentProcessing: async (payment) => { /* ... */ },
    onPaymentExpired: async (payment) => { /* ... */ },
    onPaymentRefunded: async (payment) => { /* ... */ },
  }),
);
```

### Next.js App Router

```typescript
// app/api/webhooks/goblink/route.ts
import { createWebhookHandler } from "@goblink/merchant-sdk/nextjs";

export const POST = createWebhookHandler({
  secret: process.env.GOBLINK_WEBHOOK_SECRET!,
  onPaymentConfirmed: async (payment) => {
    // Fulfill the order
    console.log("Paid:", payment.id);
  },
  onPaymentFailed: async (payment) => {
    console.log("Failed:", payment.id);
  },
});
```

## React Components

```bash
# React 18+ is a peer dependency (optional)
npm install react
```

### PayButton

Drop-in payment button that creates a payment and opens the checkout:

```tsx
import { PayButton } from "@goblink/merchant-sdk/react";

function Checkout() {
  return (
    <PayButton
      apiKey="gb_test_xxx"
      amount={9.99}
      currency="USD"
      orderId="order_123"
      returnUrl="https://example.com/thanks"
      theme="light"               // "light" | "dark"
      label="Pay with Crypto"     // Button text
      className="my-button"       // Optional CSS class
      onSuccess={(paymentId) => {
        console.log("Payment confirmed:", paymentId);
      }}
      onError={(error) => {
        console.error("Payment failed:", error);
      }}
    />
  );
}
```

### PaymentStatus

Real-time payment status with animated progress stages:

```tsx
import { PaymentStatus } from "@goblink/merchant-sdk/react";

function StatusPage({ paymentId }: { paymentId: string }) {
  return (
    <PaymentStatus
      paymentId={paymentId}
      apiKey="gb_test_xxx"
      pollInterval={3000}          // Poll interval in ms (default: 3000)
      onComplete={(status) => {
        console.log("Final status:", status);
      }}
      onError={(error) => {
        console.error("Error:", error);
      }}
    />
  );
}
```

## CLI Scaffolder

Quickly scaffold a new project with goBlink integration:

```bash
npx create-goblink-app
```

Prompts for:
- **Framework**: Next.js, Express, or plain Node.js
- **Mode**: Test or live

Generates a working project with payment routes, webhook handler, environment config, and README.

## TypeScript Types

All types are exported:

```typescript
import type {
  Payment,
  Refund,
  Webhook,
  Merchant,
  WebhookEvent,
  PaymentStatus,
  Currency,
  CreatePaymentParams,
  ListPaymentsParams,
  CreateWebhookParams,
  GoBlinkConfig,
  RefundParams,
  PaginatedPayments,
  WebhookHandlerOptions,
  WebhookPayload,
} from "@goblink/merchant-sdk";
```

### Supported Currencies

`USD`, `CAD`, `EUR`, `GBP`, `AUD`, `JPY`, `CHF`, `SEK`, `NOK`, `DKK`, `NZD`, `SGD`, `HKD`, `KRW`, `MXN`, `BRL`, `INR`, `TRY`, `PLN`, `ZAR`

### Webhook Events

`payment.created`, `payment.processing`, `payment.confirmed`, `payment.failed`, `payment.expired`, `payment.refunded`

## Error Handling

All API errors throw `GoBlinkError` with structured details:

```typescript
import { GoBlink, GoBlinkError } from "@goblink/merchant-sdk";

try {
  await goblink.payments.create({ amount: -1 });
} catch (error) {
  if (error instanceof GoBlinkError) {
    console.log(error.message);  // Human-readable message
    console.log(error.status);   // HTTP status (400, 401, 404, 429, 500)
    console.log(error.code);     // Error code (VALIDATION_ERROR, AUTHENTICATION_FAILED, etc.)
    console.log(error.details);  // Additional error details
  }
}
```

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters |
| 401 | `AUTHENTICATION_FAILED` | Invalid or missing API key |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 500 | `SERVER_ERROR` | Internal server error |

## Test Mode

Use a `gb_test_` prefixed API key to enable test mode. Test payments don't process real transactions.

```typescript
const goblink = new GoBlink({
  apiKey: "gb_test_your_key_here",
});

console.log(goblink.isTestMode); // true
```

## Examples

See the [`examples/`](./examples) directory for complete working examples:

- **[Next.js App Router](./examples/nextjs/)** — Full checkout with PayButton, PaymentStatus, API routes, and webhook handler
- **[Express](./examples/express/)** — REST API with payments, refunds, and webhook handler

## Requirements

- Node.js 18+ (uses native `fetch`)
- Zero runtime dependencies

## License

MIT
