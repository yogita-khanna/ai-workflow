import { HealthRepository } from "../repositories/health.repository";

export class HealthController {
  constructor(private readonly healthRepository: HealthRepository) {}

  async checkHealth() {
    const isDbConnected = await this.healthRepository.checkDb();

    if (!isDbConnected) {
      throw new Error("Database is unreachable");
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
