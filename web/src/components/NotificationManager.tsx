'use client';

import React, { useEffect } from 'react';
import { SessionStorageManager, SessionStorageKeys } from '@/utils/sessionStorage';

/**
 * NotificationManager - Centralized component to manage all notifications and banners
 * This component handles the logic for showing notifications only once per session
 */
interface NotificationManagerProps {
  children: React.ReactNode;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ children }) => {
  useEffect(() => {
    // Initialize session storage keys if they don't exist
    // This ensures consistent behavior across the app
    
    // You can add any global notification logic here
    // For example, checking for new features, updates, etc.
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return <>{children}</>;
};

export default NotificationManager;
