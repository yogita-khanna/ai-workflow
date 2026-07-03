// Simulated NestJS decorators
const Controller = (path: string) => (target: any) => {};
const Get = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Put = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Req = () => (target: any, propertyKey: string, parameterIndex: number) => {};
const Body = () => (target: any, propertyKey: string, parameterIndex: number) => {};
const UseGuards = (guard: any) => (target: any) => {};
const JwtAuthGuard = class {};

import { IsString, IsOptional, IsUrl } from 'class-validator';
import { UserProfileService } from '../services/user-profile.service';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsUrl()
  @IsOptional()
  avatar_url?: string;
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
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
      updateProfileDto.first_name || '',
      updateProfileDto.last_name || '',
      updateProfileDto.avatar_url || ''
    );
  }
}
