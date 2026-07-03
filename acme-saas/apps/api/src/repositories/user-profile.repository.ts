import { Pool } from 'pg';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export class UserProfileRepository {
  constructor(private readonly db: Pool) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const query = `SELECT id, email, first_name, last_name, avatar_url, created_at, updated_at FROM users WHERE id = $1;`;
    const result = await this.db.query(query, [userId]);
    
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }

  async updateProfile(userId: string, firstName: string, lastName: string, avatarUrl: string): Promise<UserProfile | null> {
    const query = `UPDATE users SET first_name = $1, last_name = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *;`;
    const result = await this.db.query(query, [firstName, lastName, avatarUrl, userId]);

    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  }
}
