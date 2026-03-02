import type { WebhookHandlerOptions, WebhookPayload, Payment } from "../types.js";
import { verifyWebhookSignature } from "./index.js";

const eventHandlerMap: Record<string, keyof WebhookHandlerOptions> = {
  "payment.created": "onPaymentCreated",
  "payment.processing": "onPaymentProcessing",
  "payment.confirmed": "onPaymentConfirmed",
  "payment.failed": "onPaymentFailed",
  "payment.expired": "onPaymentExpired",
  "payment.refunded": "onPaymentRefunded",
};

export function createWebhookHandler(options: WebhookHandlerOptions) {
  return async (request: Request): Promise<Response> => {
    try {
      const rawBody = await request.text();
      const signature = request.headers.get("x-goblink-signature") ?? "";
      const timestamp = request.headers.get("x-goblink-timestamp") ?? undefined;

      if (!verifyWebhookSignature(rawBody, signature, options.secret, timestamp)) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const payload = JSON.parse(rawBody) as WebhookPayload;
      const handlerKey = eventHandlerMap[payload.event];

      if (handlerKey) {
        const handler = options[handlerKey] as
          | ((payment: Payment) => void | Promise<void>)
          | undefined;
        if (handler) {
          await handler(payload.data);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

export type { WebhookHandlerOptions } from "../types.js";
