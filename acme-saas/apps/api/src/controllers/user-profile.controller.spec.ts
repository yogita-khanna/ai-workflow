import { UserProfileController, UpdateProfileDto } from './user-profile.controller';
import { UserProfileService } from '../services/user-profile.service';

describe('UserProfileController', () => {
  let controller: UserProfileController;
  let mockService: jest.Mocked<UserProfileService>;

  beforeEach(() => {
    mockService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    } as any;
    controller = new UserProfileController(mockService);
  });

  describe('getProfile', () => {
    it('should return the user profile for the authenticated user', async () => {
      const mockRequest = { user: { id: 'uuid-123' } };
      const mockProfile = { id: 'uuid-123', first_name: 'John' } as any;
      mockService.getProfile.mockResolvedValueOnce(mockProfile);

      const result = await controller.getProfile(mockRequest as any);

      expect(result).toEqual(mockProfile);
      expect(mockService.getProfile).toHaveBeenCalledWith('uuid-123');
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile', async () => {
      const mockRequest = { user: { id: 'uuid-123' } };
      const dto: UpdateProfileDto = { first_name: 'Jane', last_name: 'Doe', avatar_url: 'avatar.jpg' };
      const mockProfile = { id: 'uuid-123', first_name: 'Jane' } as any;
      
      mockService.updateProfile.mockResolvedValueOnce(mockProfile);

      const result = await controller.updateProfile(mockRequest as any, dto);

      expect(result).toEqual(mockProfile);
      expect(mockService.updateProfile).toHaveBeenCalledWith('uuid-123', 'Jane', 'Doe', 'avatar.jpg');
    });
  });
});
