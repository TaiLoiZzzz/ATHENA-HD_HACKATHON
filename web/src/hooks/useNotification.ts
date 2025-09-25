import { useState, useEffect } from 'react';
import { SessionStorageManager, SessionStorageKeys } from '@/utils/sessionStorage';

/**
 * Custom hook for managing notifications and banners
 * Provides easy access to notification state and controls
 */
export const useNotification = (key: keyof typeof SessionStorageKeys) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if notification should be shown
    const shouldShow = SessionStorageManager.shouldShow(SessionStorageKeys[key]);
    setIsVisible(shouldShow);
    setIsDismissed(!shouldShow);
  }, [key]);

  const dismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    SessionStorageManager.markAsShown(SessionStorageKeys[key]);
  };

  const reset = () => {
    SessionStorageManager.remove(SessionStorageKeys[key]);
    setIsVisible(true);
    setIsDismissed(false);
  };

  return {
    isVisible,
    isDismissed,
    dismiss,
    reset,
    shouldShow: SessionStorageManager.shouldShow(SessionStorageKeys[key])
  };
};

export default useNotification;
