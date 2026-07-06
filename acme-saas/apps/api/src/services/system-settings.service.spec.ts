import { SystemSettingsService } from "./system-settings.service";
import { SystemSettingsRepository } from "../repositories/system-settings.repository";

describe("SystemSettingsService", () => {
  let service: SystemSettingsService;
  let mockRepository: jest.Mocked<SystemSettingsRepository>;

  beforeEach(() => {
    mockRepository = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn(),
    } as any;
    service = new SystemSettingsService(mockRepository);
  });

  describe("getSettings", () => {
    it("should return settings if found", async () => {
      const mockSettings = {
        user_id: "1",
        theme: "dark",
        notifications_enabled: true,
      };
      mockRepository.getSettings.mockResolvedValueOnce(mockSettings);

      const result = await service.getSettings("1");
      expect(result).toEqual(mockSettings);
    });

    it("should return default settings if not found", async () => {
      mockRepository.getSettings.mockResolvedValueOnce(null);

      const result = await service.getSettings("1");
      expect(result).toEqual({
        user_id: "1",
        theme: "light",
        notifications_enabled: true,
      });
    });
  });

  describe("updateSettings", () => {
    it("should upsert settings via repository", async () => {
      const mockSettings = {
        user_id: "1",
        theme: "dark",
        notifications_enabled: false,
      };
      mockRepository.upsertSettings.mockResolvedValueOnce(mockSettings);

      const result = await service.updateSettings("1", "dark", false);
      expect(result).toEqual(mockSettings);
      expect(mockRepository.upsertSettings).toHaveBeenCalledWith(
        "1",
        "dark",
        false,
      );
    });
  });
});
