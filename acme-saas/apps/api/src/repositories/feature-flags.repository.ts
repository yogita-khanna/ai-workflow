import { Pool } from 'pg';

export interface FeatureFlag {
  name: string;
  is_enabled: boolean;
  updated_at?: Date;
}

export class FeatureFlagsRepository {
  constructor(private readonly db: Pool) {}

  async getAllFlags(): Promise<FeatureFlag[]> {
    const query = `SELECT name, is_enabled, updated_at FROM feature_flags;`;
    const result = await this.db.query(query);
    
    return result.rows;
  }

  async upsertFlag(name: string, isEnabled: boolean): Promise<FeatureFlag> {
    const query = `INSERT INTO feature_flags (name, is_enabled) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = CURRENT_TIMESTAMP RETURNING *;`;
    const result = await this.db.query(query, [name, isEnabled]);
    
    return result.rows[0];
  }
}
