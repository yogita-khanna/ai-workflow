import { PasswordResetTokensRepository } from './password-reset-tokens.repository';

// Mocking pg.Pool as explicitly required by CLAUDE.md
const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

describe('PasswordResetTokensRepository', () => {
  let repository: PasswordResetTokensRepository;

  beforeEach(() => {
    repository = new PasswordResetTokensRepository(mockPool);
    jest.clearAllMocks();
  });

  it('should insert a hashed token into the database', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await repository.createToken(
      'hashed_token_xyz',
      'user_uuid_123',
      new Date('2026-12-31T23:59:59Z')
    );

    expect(result).toBe(true);
    
    // Strict enforcement: ensure raw SQL with parameterized $1, $2, $3 queries is used (No ORM!)
    expect(mockQuery).toHaveBeenCalledWith(
      `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`,
      ['hashed_token_xyz', 'user_uuid_123', new Date('2026-12-31T23:59:59Z')]
    );
  });
});
