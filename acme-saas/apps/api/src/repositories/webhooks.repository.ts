import { Pool } from 'pg';

export interface Webhook {
  id: number;
  url: string;
  event_type: string;
}

export class WebhooksRepository {
  constructor(private readonly db: Pool) {}

  async getWebhooks(): Promise<Webhook[]> {
    const query = `SELECT id, url, event_type FROM webhooks;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async createWebhook(url: string, eventType: string): Promise<Webhook> {
    const query = `INSERT INTO webhooks (url, event_type) VALUES ($1, $2) RETURNING id, url, event_type;`;
    const result = await this.db.query(query, [url, eventType]);
    return result.rows[0];
  }
}
