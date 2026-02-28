import type { HttpClient } from "../client.js";
import type {
  Payment,
  CreatePaymentParams,
  ListPaymentsParams,
  PaginatedPayments,
  Refund,
  RefundParams,
} from "../types.js";

export class Payments {
  constructor(private readonly client: HttpClient) {}

  async create(params: CreatePaymentParams): Promise<Payment> {
    return this.client.post<Payment>("/payments", params);
  }

  async get(id: string): Promise<Payment> {
    return this.client.get<Payment>(`/payments/${encodeURIComponent(id)}`);
  }

  async list(params: ListPaymentsParams = {}): Promise<PaginatedPayments> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.status) query.status = params.status;
    if (params.orderId) query.orderId = params.orderId;
    if (params.isTest !== undefined) query.is_test = params.isTest;
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.offset !== undefined) query.offset = params.offset;
    return this.client.get<PaginatedPayments>("/payments", query);
  }

  async refund(id: string, params: RefundParams = {}): Promise<Refund> {
    return this.client.post<Refund>(`/payments/${encodeURIComponent(id)}/refund`, params);
  }
}
