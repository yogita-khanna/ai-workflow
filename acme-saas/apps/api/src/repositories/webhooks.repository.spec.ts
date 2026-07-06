import { WebhooksRepository } from "./webhooks.repository";

const mockQuery = jest.fn();
const mockPool = { query: mockQuery } as any;

describe("WebhooksRepository", () => {
  let repository: WebhooksRepository;

  beforeEach(() => {
    repository = new WebhooksRepository(mockPool);
    jest.clearAllMocks();
  });

  describe("getWebhooks", () => {
    it("should return all webhooks", async () => {
      const mockRows = [
        { id: 1, url: "http://test", event_type: "user.created" },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockRows, rowCount: 1 });

      const result = await repository.getWebhooks();

      expect(result).toEqual(mockRows);
      expect(mockQuery).toHaveBeenCalledWith(
        `SELECT id, url, event_type FROM webhooks;`,
      );
    });
  });

  describe("createWebhook", () => {
    it("should create and return webhook", async () => {
      const mockRow = { id: 1, url: "http://test", event_type: "user.created" };
      mockQuery.mockResolvedValueOnce({ rows: [mockRow], rowCount: 1 });

      const result = await repository.createWebhook(
        "http://test",
        "user.created",
      );

      expect(result).toEqual(mockRow);
      expect(mockQuery).toHaveBeenCalledWith(
        `INSERT INTO webhooks (url, event_type) VALUES ($1, $2) RETURNING id, url, event_type;`,
        ["http://test", "user.created"],
      );
    });
  });
});
