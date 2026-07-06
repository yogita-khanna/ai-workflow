import { SystemSettingsRepository } from "./system-settings.repository";

const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

describe("SystemSettingsRepository", () => {
  let repository: SystemSettingsRepository;

  beforeEach(() => {
    repository = new SystemSettingsRepository(mockPool);
    jest.clearAllMocks();
  });

  describe("getSettings", () => {
    it("should return settings if they exist", async () => {
      const mockSettings = {
        user_id: "uuid-1",
        theme: "dark",
        notifications_enabled: false,
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockSettings], rowCount: 1 });

      const result = await repository.getSettings("uuid-1");

      expect(result).toEqual(mockSettings);
      expect(mockQuery).toHaveBeenCalledWith(
        `SELECT user_id, theme, notifications_enabled, updated_at FROM system_settings WHERE user_id = $1;`,
        ["uuid-1"],
      );
    });

    it("should return null if settings do not exist", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await repository.getSettings("uuid-999");
      expect(result).toBeNull();
    });
  });

  describe("upsertSettings", () => {
    it("should upsert and return the new settings", async () => {
      const mockSettings = {
        user_id: "uuid-1",
        theme: "dark",
        notifications_enabled: false,
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockSettings], rowCount: 1 });

      const result = await repository.upsertSettings("uuid-1", "dark", false);

      expect(result).toEqual(mockSettings);
      expect(mockQuery).toHaveBeenCalledWith(
        `INSERT INTO system_settings (user_id, theme, notifications_enabled) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, notifications_enabled = EXCLUDED.notifications_enabled, updated_at = CURRENT_TIMESTAMP RETURNING *;`,
        ["uuid-1", "dark", false],
      );
    });
  });
});
