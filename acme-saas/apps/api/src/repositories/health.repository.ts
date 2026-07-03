import { Pool } from 'pg';

export class HealthRepository {
  constructor(private readonly db: Pool) {}

  async checkDb(): Promise<boolean> {
    try {
      const result = await this.db.query('SELECT 1 AS status');
      return result.rowCount === 1;
    } catch (e) {
      return false;
    }
  }
}
