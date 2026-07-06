import {
  FeatureFlagsRepository,
  FeatureFlag,
} from "../repositories/feature-flags.repository";

export class FeatureFlagsService {
  constructor(private readonly repository: FeatureFlagsRepository) {}

  async getAllFlags(): Promise<FeatureFlag[]> {
    return this.repository.getAllFlags();
  }

  async setFlag(name: string, isEnabled: boolean): Promise<FeatureFlag> {
    return this.repository.upsertFlag(name, isEnabled);
  }
}
