import { FeatureFlagsService } from "./feature-flags.service";
import { FeatureFlagsRepository } from "../repositories/feature-flags.repository";

describe("FeatureFlagsService", () => {
  let service: FeatureFlagsService;
  let mockRepository: jest.Mocked<FeatureFlagsRepository>;

  beforeEach(() => {
    mockRepository = {
      getAllFlags: jest.fn(),
      upsertFlag: jest.fn(),
    } as any;
    service = new FeatureFlagsService(mockRepository);
  });

  describe("getAllFlags", () => {
    it("should return all flags from repository", async () => {
      const mockFlags = [{ name: "new_ui", is_enabled: true }];
      mockRepository.getAllFlags.mockResolvedValueOnce(mockFlags);

      const result = await service.getAllFlags();
      expect(result).toEqual(mockFlags);
    });
  });

  describe("setFlag", () => {
    it("should upsert flag via repository", async () => {
      const mockFlag = { name: "new_ui", is_enabled: true };
      mockRepository.upsertFlag.mockResolvedValueOnce(mockFlag);

      const result = await service.setFlag("new_ui", true);
      expect(result).toEqual(mockFlag);
      expect(mockRepository.upsertFlag).toHaveBeenCalledWith("new_ui", true);
    });
  });
});
