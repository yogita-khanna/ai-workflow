import { Pool } from 'pg';

export interface SystemSettings {
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  updated_at?: Date;
}

export class SystemSettingsRepository {
  constructor(private readonly db: Pool) {}

  async getSettings(userId: string): Promise<SystemSettings | null> {
    const query = `SELECT user_id, theme, notifications_enabled, updated_at FROM system_settings WHERE user_id = $1;`;
    const result = await this.db.query(query, [userId]);
    
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  async upsertSettings(userId: string, theme: string, notificationsEnabled: boolean): Promise<SystemSettings> {
    const query = `INSERT INTO system_settings (user_id, theme, notifications_enabled) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, notifications_enabled = EXCLUDED.notifications_enabled, updated_at = CURRENT_TIMESTAMP RETURNING *;`;
    const result = await this.db.query(query, [userId, theme, notificationsEnabled]);
    
    return result.rows[0];
  }
}
