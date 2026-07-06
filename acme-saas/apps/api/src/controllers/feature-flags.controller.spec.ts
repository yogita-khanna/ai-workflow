import {
  FeatureFlagsController,
  SetFeatureFlagDto,
} from "./feature-flags.controller";
import { FeatureFlagsService } from "../services/feature-flags.service";

describe("FeatureFlagsController", () => {
  let controller: FeatureFlagsController;
  let mockService: jest.Mocked<FeatureFlagsService>;

  beforeEach(() => {
    mockService = {
      getAllFlags: jest.fn(),
      setFlag: jest.fn(),
    } as any;
    controller = new FeatureFlagsController(mockService);
  });

  describe("getAllFlags", () => {
    it("should return all flags", async () => {
      const mockFlags = [{ name: "new_ui", is_enabled: true }] as any;
      mockService.getAllFlags.mockResolvedValueOnce(mockFlags);

      const result = await controller.getAllFlags();
      expect(result).toEqual(mockFlags);
      expect(mockService.getAllFlags).toHaveBeenCalled();
    });
  });

  describe("setFlag", () => {
    it("should update and return the flag", async () => {
      const dto: SetFeatureFlagDto = { name: "new_ui", is_enabled: true };
      const mockFlag = { name: "new_ui", is_enabled: true } as any;

      mockService.setFlag.mockResolvedValueOnce(mockFlag);

      const result = await controller.setFlag(dto);
      expect(result).toEqual(mockFlag);
      expect(mockService.setFlag).toHaveBeenCalledWith("new_ui", true);
    });
  });
});
