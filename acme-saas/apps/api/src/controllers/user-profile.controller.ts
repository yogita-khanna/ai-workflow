// Simulated NestJS decorators
const Controller = (path: string) => (target: any) => {};
const Get = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Put = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Req = () => (target: any, propertyKey: string, parameterIndex: number) => {};
const Body = () => (target: any, propertyKey: string, parameterIndex: number) => {};

import { UserProfileService } from '../services/user-profile.service';

export class UpdateProfileDto {
  first_name!: string;
  last_name!: string;
  avatar_url!: string;
}

@Controller('profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  async getProfile(@Req() request: any) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return this.userProfileService.getProfile(userId);
  }

  @Put()
  async updateProfile(@Req() request: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return this.userProfileService.updateProfile(
      userId,
      updateProfileDto.first_name,
      updateProfileDto.last_name,
      updateProfileDto.avatar_url
    );
  }
}
