import { Pool } from 'pg';

export class PasswordResetTokensRepository {
  constructor(private readonly db: Pool) {}

  async createToken(tokenHash: string, userId: string, expiresAt: Date): Promise<boolean> {
    const query = `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`;
    
    const result = await this.db.query(query, [tokenHash, userId, expiresAt]);
    
    return result.rowCount === 1;
  }
}
