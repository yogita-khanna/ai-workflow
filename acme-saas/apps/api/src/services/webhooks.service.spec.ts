import { WebhooksService } from './webhooks.service';
import { WebhooksRepository } from '../repositories/webhooks.repository';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let mockRepository: jest.Mocked<WebhooksRepository>;

  beforeEach(() => {
    mockRepository = {
      getWebhooks: jest.fn(),
      createWebhook: jest.fn(),
    } as any;
    service = new WebhooksService(mockRepository);
  });

  describe('getWebhooks', () => {
    it('should return all webhooks from repository', async () => {
      const mockWebhooks = [{ id: 1, url: 'http://test', event_type: 'user.created' }];
      mockRepository.getWebhooks.mockResolvedValueOnce(mockWebhooks);

      const result = await service.getWebhooks();
      expect(result).toEqual(mockWebhooks);
    });
  });

  describe('createWebhook', () => {
    it('should create webhook via repository', async () => {
      const mockWebhook = { id: 1, url: 'http://test', event_type: 'user.created' };
      mockRepository.createWebhook.mockResolvedValueOnce(mockWebhook);

      const result = await service.createWebhook('http://test', 'user.created');
      expect(result).toEqual(mockWebhook);
      expect(mockRepository.createWebhook).toHaveBeenCalledWith('http://test', 'user.created');
    });
  });
});
