export class ThemeService {
  static async getThemePreference(): Promise<'light' | 'dark'> {
    // Mock implementation - would use AsyncStorage or SecureStore
    return 'light';
  }

  static async setThemePreference(theme: 'light' | 'dark'): Promise<void> {
    // Mock implementation
  }
} 