import type { HttpClient } from "../client.js";
import type { Merchant } from "../types.js";

export class MerchantResource {
  constructor(private readonly client: HttpClient) {}

  async get(): Promise<Merchant> {
    return this.client.get<Merchant>("/merchant");
  }
}
