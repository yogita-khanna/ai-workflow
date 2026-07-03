import { SystemSettingsRepository, SystemSettings } from '../repositories/system-settings.repository';

export class SystemSettingsService {
  constructor(private readonly repository: SystemSettingsRepository) {}

  async getSettings(userId: string): Promise<SystemSettings> {
    const settings = await this.repository.getSettings(userId);
    if (!settings) {
      // Return defaults if none found yet
      return {
        user_id: userId,
        theme: 'light',
        notifications_enabled: true
      };
    }
    return settings;
  }

  async updateSettings(userId: string, theme: string, notificationsEnabled: boolean): Promise<SystemSettings> {
    return this.repository.upsertSettings(userId, theme, notificationsEnabled);
  }
}
