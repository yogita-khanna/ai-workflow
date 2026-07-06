import {
  SystemSettingsController,
  UpdateSettingsDto,
} from "./system-settings.controller";
import { SystemSettingsService } from "../services/system-settings.service";

describe("SystemSettingsController", () => {
  let controller: SystemSettingsController;
  let mockService: jest.Mocked<SystemSettingsService>;

  beforeEach(() => {
    mockService = {
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    } as any;
    controller = new SystemSettingsController(mockService);
  });

  describe("getSettings", () => {
    it("should return settings for authenticated user", async () => {
      const mockRequest = { user: { id: "uuid-1" } };
      const mockSettings = {
        user_id: "uuid-1",
        theme: "light",
        notifications_enabled: true,
      } as any;
      mockService.getSettings.mockResolvedValueOnce(mockSettings);

      const result = await controller.getSettings(mockRequest as any);
      expect(result).toEqual(mockSettings);
      expect(mockService.getSettings).toHaveBeenCalledWith("uuid-1");
    });

    it("should throw error if user not authenticated", async () => {
      const mockRequest = { user: null };
      await expect(controller.getSettings(mockRequest as any)).rejects.toThrow(
        "Unauthorized",
      );
    });
  });

  describe("updateSettings", () => {
    it("should update settings for authenticated user", async () => {
      const mockRequest = { user: { id: "uuid-1" } };
      const dto: UpdateSettingsDto = {
        theme: "dark",
        notifications_enabled: false,
      };
      const mockSettings = {
        user_id: "uuid-1",
        theme: "dark",
        notifications_enabled: false,
      } as any;

      mockService.updateSettings.mockResolvedValueOnce(mockSettings);

      const result = await controller.updateSettings(mockRequest as any, dto);
      expect(result).toEqual(mockSettings);
      expect(mockService.updateSettings).toHaveBeenCalledWith(
        "uuid-1",
        "dark",
        false,
      );
    });
  });
});
