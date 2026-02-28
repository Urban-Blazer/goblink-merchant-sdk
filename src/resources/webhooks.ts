import type { HttpClient } from "../client.js";
import type { Webhook, CreateWebhookParams } from "../types.js";

export class Webhooks {
  constructor(private readonly client: HttpClient) {}

  async create(params: CreateWebhookParams): Promise<Webhook> {
    return this.client.post<Webhook>("/webhooks", params);
  }

  async list(): Promise<Webhook[]> {
    return this.client.get<Webhook[]>("/webhooks");
  }

  async get(id: string): Promise<Webhook> {
    return this.client.get<Webhook>(`/webhooks/${encodeURIComponent(id)}`);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/webhooks/${encodeURIComponent(id)}`);
  }

  async test(id: string): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>(`/webhooks/${encodeURIComponent(id)}/test`);
  }
}
