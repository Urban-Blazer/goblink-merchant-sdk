import { HttpClient } from "./client.js";
import { Payments } from "./resources/payments.js";
import { Webhooks } from "./resources/webhooks.js";
import { MerchantResource } from "./resources/merchant.js";
import { verifyWebhookSignature } from "./webhooks/index.js";
import type { GoBlinkConfig } from "./types.js";

export class GoBlink {
  public readonly payments: Payments;
  public readonly webhooks: Webhooks;
  public readonly merchant: MerchantResource;
  public readonly isTestMode: boolean;

  private readonly client: HttpClient;

  constructor(config: GoBlinkConfig) {
    if (!config.apiKey) {
      throw new Error("apiKey is required");
    }

    this.isTestMode = config.apiKey.startsWith("gb_test_");

    this.client = new HttpClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? "https://merchant.goblink.io/api/v1",
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 2,
      onError: config.onError,
    });

    this.payments = new Payments(this.client);
    this.webhooks = new Webhooks(this.client);
    this.merchant = new MerchantResource(this.client);
  }

  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
    timestamp?: string,
  ): boolean {
    return verifyWebhookSignature(payload, signature, secret, timestamp);
  }
}

// Re-export everything
export { GoBlinkError } from "./errors.js";
export { verifyWebhookSignature } from "./webhooks/index.js";
export type {
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
} from "./types.js";
