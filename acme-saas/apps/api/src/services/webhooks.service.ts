import { WebhooksRepository, Webhook } from '../repositories/webhooks.repository';

export class WebhooksService {
  constructor(private readonly repository: WebhooksRepository) {}

  async getWebhooks(): Promise<Webhook[]> {
    return this.repository.getWebhooks();
  }

  async createWebhook(url: string, eventType: string): Promise<Webhook> {
    return this.repository.createWebhook(url, eventType);
  }
}
