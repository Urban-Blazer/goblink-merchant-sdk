// --- Currency ---

export type Currency =
  | "USD"
  | "CAD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "JPY"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "NZD"
  | "SGD"
  | "HKD"
  | "KRW"
  | "MXN"
  | "BRL"
  | "INR"
  | "TRY"
  | "PLN"
  | "ZAR";

// --- Payment ---

export type PaymentStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "failed"
  | "expired"
  | "refunded";

export interface Payment {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  depositAddress: string;
  paymentUrl: string;
  orderId?: string;
  expiresAt: string;
  createdAt: string;
  isTest: boolean;
  originalAmount?: number;
  originalCurrency?: Currency;
  refunds?: Refund[];
}

export interface Refund {
  id: string;
  amount: number;
  reason?: string;
  status: string;
  createdAt: string;
}

export interface CreatePaymentParams {
  amount: number;
  currency?: Currency;
  orderId?: string;
  returnUrl?: string;
  metadata?: Record<string, unknown>;
  expiresInMinutes?: number;
}

export interface ListPaymentsParams {
  status?: PaymentStatus;
  orderId?: string;
  isTest?: boolean;
  limit?: number;
  offset?: number;
}

export interface RefundParams {
  amount?: number;
  reason?: string;
}

export interface PaginatedPayments {
  data: Payment[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// --- Webhook ---

export type WebhookEvent =
  | "payment.created"
  | "payment.processing"
  | "payment.confirmed"
  | "payment.failed"
  | "payment.expired"
  | "payment.refunded";

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  createdAt: string;
}

export interface CreateWebhookParams {
  url: string;
  events?: WebhookEvent[];
}

// --- Merchant ---

export interface Merchant {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  isVerified: boolean;
  createdAt: string;
  [key: string]: unknown;
}

// --- Config ---

export interface GoBlinkConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
}

// --- Webhook Handler ---

export interface WebhookPayload {
  event: WebhookEvent;
  data: Payment;
  timestamp: string;
}

export interface WebhookHandlerOptions {
  secret: string;
  onPaymentCreated?: (payment: Payment) => void | Promise<void>;
  onPaymentProcessing?: (payment: Payment) => void | Promise<void>;
  onPaymentConfirmed?: (payment: Payment) => void | Promise<void>;
  onPaymentFailed?: (payment: Payment) => void | Promise<void>;
  onPaymentExpired?: (payment: Payment) => void | Promise<void>;
  onPaymentRefunded?: (payment: Payment) => void | Promise<void>;
}
