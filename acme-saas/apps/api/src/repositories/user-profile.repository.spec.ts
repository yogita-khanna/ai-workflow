import { UserProfileRepository } from './user-profile.repository';

const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

describe('UserProfileRepository', () => {
  let repository: UserProfileRepository;

  beforeEach(() => {
    repository = new UserProfileRepository(mockPool);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return a user profile when given a valid ID', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      const result = await repository.getProfile('uuid-123');

      expect(result).toEqual(mockUser);
      expect(mockQuery).toHaveBeenCalledWith(
        `SELECT id, email, first_name, last_name, avatar_url, created_at, updated_at FROM users WHERE id = $1;`,
        ['uuid-123']
      );
    });

    it('should return null if user profile is not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await repository.getProfile('uuid-999');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update and return the user profile', async () => {
      const mockUpdatedUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedUser], rowCount: 1 });

      const result = await repository.updateProfile('uuid-123', 'Jane', 'Smith', 'https://example.com/avatar.jpg');

      expect(result).toEqual(mockUpdatedUser);
      expect(mockQuery).toHaveBeenCalledWith(
        `UPDATE users SET first_name = $1, last_name = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *;`,
        ['Jane', 'Smith', 'https://example.com/avatar.jpg', 'uuid-123']
      );
    });

    it('should return null if the user to update does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await repository.updateProfile('uuid-999', 'Jane', 'Smith', 'https://example.com/avatar.jpg');

      expect(result).toBeNull();
    });
  });
});
