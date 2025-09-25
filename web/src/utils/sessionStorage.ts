// Utility functions for managing session storage
// These help manage one-time notifications and banners

export const SessionStorageKeys = {
  DEMO_BANNER_DISMISSED: 'demo-banner-dismissed',
  SOV_TOKEN_BANNER_DISMISSED: 'sov-token-banner-dismissed',
  WELCOME_NOTIFICATION_SHOWN: 'welcome-notification-shown',
  RANK_UPGRADE_SHOWN: 'rank-upgrade-shown',
  PAYMENT_SUCCESS_SHOWN: 'payment-success-shown'
} as const;

export class SessionStorageManager {
  /**
   * Check if a key exists in session storage
   */
  static has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(key) !== null;
  }

  /**
   * Get a value from session storage
   */
  static get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  }

  /**
   * Set a value in session storage
   */
  static set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, value);
  }

  /**
   * Remove a key from session storage
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }

  /**
   * Clear all session storage
   */
  static clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
  }

  /**
   * Check if a notification/banner should be shown
   */
  static shouldShow(key: string): boolean {
    return !this.has(key);
  }

  /**
   * Mark a notification/banner as shown/dismissed
   */
  static markAsShown(key: string): void {
    this.set(key, 'true');
  }

  /**
   * Reset all notification states (useful for testing)
   */
  static resetNotifications(): void {
    Object.values(SessionStorageKeys).forEach(key => {
      this.remove(key);
    });
  }
}

export default SessionStorageManager;
