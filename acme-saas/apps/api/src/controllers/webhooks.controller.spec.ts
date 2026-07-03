import { WebhooksController, CreateWebhookDto } from './webhooks.controller';
import { WebhooksService } from '../services/webhooks.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let mockService: jest.Mocked<WebhooksService>;

  beforeEach(() => {
    mockService = {
      getWebhooks: jest.fn(),
      createWebhook: jest.fn(),
    } as any;
    controller = new WebhooksController(mockService);
  });

  describe('getWebhooks', () => {
    it('should return all webhooks', async () => {
      const mockWebhooks = [{ id: 1, url: 'http://test', event_type: 'user.created' }] as any;
      mockService.getWebhooks.mockResolvedValueOnce(mockWebhooks);

      const result = await controller.getWebhooks();
      expect(result).toEqual(mockWebhooks);
      expect(mockService.getWebhooks).toHaveBeenCalled();
    });
  });

  describe('createWebhook', () => {
    it('should create and return the webhook', async () => {
      const dto: CreateWebhookDto = { url: 'http://test', event_type: 'user.created' };
      const mockWebhook = { id: 1, url: 'http://test', event_type: 'user.created' } as any;
      
      mockService.createWebhook.mockResolvedValueOnce(mockWebhook);

      const result = await controller.createWebhook(dto);
      expect(result).toEqual(mockWebhook);
      expect(mockService.createWebhook).toHaveBeenCalledWith('http://test', 'user.created');
    });
  });
});
