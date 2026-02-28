import type { WebhookHandlerOptions, WebhookPayload, Payment } from "../types.js";
import { createHmac } from "node:crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expected === signature;
}

export interface WebhookRequest {
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
}

export interface WebhookResponse {
  status: (code: number) => WebhookResponse;
  json: (body: unknown) => void;
  send?: (body: string) => void;
}

function getRawBody(req: WebhookRequest): Promise<string> {
  if (typeof req.body === "string") {
    return Promise.resolve(req.body);
  }
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(JSON.stringify(req.body));
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on?.("data", (chunk: unknown) => chunks.push(Buffer.from(chunk as Uint8Array)));
    req.on?.("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on?.("error", reject);
  });
}

const eventHandlerMap: Record<string, keyof WebhookHandlerOptions> = {
  "payment.created": "onPaymentCreated",
  "payment.processing": "onPaymentProcessing",
  "payment.confirmed": "onPaymentConfirmed",
  "payment.failed": "onPaymentFailed",
  "payment.expired": "onPaymentExpired",
  "payment.refunded": "onPaymentRefunded",
};

export function webhookHandler(options: WebhookHandlerOptions) {
  return async (req: WebhookRequest, res: WebhookResponse): Promise<void> => {
    try {
      const rawBody = await getRawBody(req);
      const signature =
        (req.headers["x-goblink-signature"] as string) ?? "";

      if (!verifyWebhookSignature(rawBody, signature, options.secret)) {
        res.status(401).json({ error: "Invalid signature" });
        return;
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

      res.status(200).json({ received: true });
    } catch {
      res.status(400).json({ error: "Invalid webhook payload" });
    }
  };
}

export type { WebhookHandlerOptions, WebhookPayload } from "../types.js";
