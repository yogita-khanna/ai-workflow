const Controller = (path: string) => (target: any) => {};
const Get =
  () =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Post =
  () =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {};
const Body =
  () => (target: any, propertyKey: string, parameterIndex: number) => {};
const UseGuards = (guard: any) => (target: any) => {};
const JwtAuthGuard = class {};

import { IsUrl, IsString } from "class-validator";
import { WebhooksService } from "../services/webhooks.service";
import { Webhook } from "../repositories/webhooks.repository";

export class CreateWebhookDto {
  @IsUrl()
  url!: string;

  @IsString()
  event_type!: string;
}

@Controller("webhooks")
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async getWebhooks(): Promise<Webhook[]> {
    // FIXED: added explicit return type
    return this.webhooksService.getWebhooks();
  }

  @Post()
  async createWebhook(
    @Body() createWebhookDto: CreateWebhookDto,
  ): Promise<Webhook> {
    return this.webhooksService.createWebhook(
      createWebhookDto.url,
      createWebhookDto.event_type,
    );
  }
}
