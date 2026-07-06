import { FeatureFlagsRepository } from "./feature-flags.repository";

const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

describe("FeatureFlagsRepository", () => {
  let repository: FeatureFlagsRepository;

  beforeEach(() => {
    repository = new FeatureFlagsRepository(mockPool);
    jest.clearAllMocks();
  });

  describe("getAllFlags", () => {
    it("should return all flags", async () => {
      const mockFlags = [{ name: "new_ui", is_enabled: true }];
      mockQuery.mockResolvedValueOnce({ rows: mockFlags, rowCount: 1 });

      const result = await repository.getAllFlags();

      expect(result).toEqual(mockFlags);
      expect(mockQuery).toHaveBeenCalledWith(
        `SELECT name, is_enabled, updated_at FROM feature_flags;`,
      );
    });
  });

  describe("upsertFlag", () => {
    it("should upsert and return the new flag", async () => {
      const mockFlag = { name: "new_ui", is_enabled: true };
      mockQuery.mockResolvedValueOnce({ rows: [mockFlag], rowCount: 1 });

      const result = await repository.upsertFlag("new_ui", true);

      expect(result).toEqual(mockFlag);
      expect(mockQuery).toHaveBeenCalledWith(
        `INSERT INTO feature_flags (name, is_enabled) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = CURRENT_TIMESTAMP RETURNING *;`,
        ["new_ui", true],
      );
    });
  });
});
