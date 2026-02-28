# goBlink Express Example

Full working Express server example with goBlink Merchant SDK.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

3. Run the server:
   ```bash
   pnpm dev
   ```

## Endpoints

- `POST /payments` — Create a payment
- `GET /payments` — List payments
- `GET /payments/:id` — Get payment details
- `POST /payments/:id/refund` — Refund a payment
- `GET /merchant` — Get merchant profile
- `POST /webhooks/goblink` — Webhook handler (auto-verified)
