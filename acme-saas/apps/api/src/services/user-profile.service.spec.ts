import { UserProfileService } from "./user-profile.service";
import { UserProfileRepository } from "../repositories/user-profile.repository";

describe("UserProfileService", () => {
  let service: UserProfileService;
  let mockRepository: jest.Mocked<UserProfileRepository>;

  beforeEach(() => {
    mockRepository = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    } as any;
    service = new UserProfileService(mockRepository);
  });

  describe("getProfile", () => {
    it("should return profile when repository finds it", async () => {
      const mockProfile = { id: "1", email: "test@example.com" } as any;
      mockRepository.getProfile.mockResolvedValueOnce(mockProfile);

      const result = await service.getProfile("1");
      expect(result).toEqual(mockProfile);
      expect(mockRepository.getProfile).toHaveBeenCalledWith("1");
    });

    it("should throw an error if profile is not found", async () => {
      mockRepository.getProfile.mockResolvedValueOnce(null);

      await expect(service.getProfile("1")).rejects.toThrow("User not found");
    });
  });

  describe("updateProfile", () => {
    it("should return updated profile when repository updates it", async () => {
      const mockProfile = { id: "1", first_name: "John" } as any;
      mockRepository.updateProfile.mockResolvedValueOnce(mockProfile);

      const result = await service.updateProfile(
        "1",
        "John",
        "Doe",
        "avatar.jpg",
      );
      expect(result).toEqual(mockProfile);
      expect(mockRepository.updateProfile).toHaveBeenCalledWith(
        "1",
        "John",
        "Doe",
        "avatar.jpg",
      );
    });

    it("should throw an error if profile to update is not found", async () => {
      mockRepository.updateProfile.mockResolvedValueOnce(null);

      await expect(
        service.updateProfile("1", "John", "Doe", "avatar.jpg"),
      ).rejects.toThrow("User not found");
    });
  });
});
