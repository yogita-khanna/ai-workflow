import {
  UserProfileRepository,
  UserProfile,
} from "../repositories/user-profile.repository";

export class UserProfileService {
  constructor(private readonly repository: UserProfileRepository) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.repository.getProfile(userId);
    if (!profile) {
      // In a real NestJS app, this would be a Domain Exception mapped to a 404 in the controller.
      throw new Error("User not found");
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    firstName: string,
    lastName: string,
    avatarUrl: string,
  ): Promise<UserProfile> {
    const profile = await this.repository.updateProfile(
      userId,
      firstName,
      lastName,
      avatarUrl,
    );
    if (!profile) {
      throw new Error("User not found");
    }
    return profile;
  }
}
