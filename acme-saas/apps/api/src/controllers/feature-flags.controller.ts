// Simulated NestJS decorators
const Controller = (path: string) => (target: any) => {};
const Get = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Put = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Body = () => (target: any, propertyKey: string, parameterIndex: number) => {};
const UseGuards = (guard: any) => (target: any) => {};
const JwtAuthGuard = class {};

import { IsString, IsBoolean } from 'class-validator';
import { FeatureFlagsService } from '../services/feature-flags.service';

export class SetFeatureFlagDto {
  @IsString()
  name!: string;

  @IsBoolean()
  is_enabled!: boolean;
}

@Controller('feature-flags')
@UseGuards(JwtAuthGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  async getAllFlags() {
    return this.featureFlagsService.getAllFlags();
  }

  @Put()
  async setFlag(@Body() setFeatureFlagDto: SetFeatureFlagDto) {
    return this.featureFlagsService.setFlag(
      setFeatureFlagDto.name,
      setFeatureFlagDto.is_enabled
    );
  }
}
