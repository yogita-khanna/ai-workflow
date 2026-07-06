// Simulated NestJS decorators
const Controller = (path: string) => (target: any) => {};
const Get =
  () =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Put =
  () =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Req =
  () => (target: any, propertyKey: string, parameterIndex: number) => {};
const Body =
  () => (target: any, propertyKey: string, parameterIndex: number) => {};
const UseGuards = (guard: any) => (target: any) => {};
const JwtAuthGuard = class {};

import { IsString, IsBoolean } from "class-validator";
import { SystemSettingsService } from "../services/system-settings.service";

export class UpdateSettingsDto {
  @IsString()
  theme!: string;

  @IsBoolean()
  notifications_enabled!: boolean;
}

@Controller("settings")
@UseGuards(JwtAuthGuard)
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  async getSettings(@Req() request: any) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    return this.systemSettingsService.getSettings(userId);
  }

  @Put()
  async updateSettings(
    @Req() request: any,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    return this.systemSettingsService.updateSettings(
      userId,
      updateSettingsDto.theme,
      updateSettingsDto.notifications_enabled,
    );
  }
}
