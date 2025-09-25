# Notification System Documentation

## Overview
Hệ thống notification được thiết kế để quản lý các banner và thông báo một cách tập trung, đảm bảo chúng chỉ hiển thị một lần trong mỗi session.

## Components

### 1. SessionStorageManager
Utility class để quản lý session storage cho notifications.

```typescript
import { SessionStorageManager, SessionStorageKeys } from '@/utils/sessionStorage';

// Check if notification should be shown
const shouldShow = SessionStorageManager.shouldShow(SessionStorageKeys.DEMO_BANNER_DISMISSED);

// Mark notification as shown
SessionStorageManager.markAsShown(SessionStorageKeys.DEMO_BANNER_DISMISSED);

// Reset all notifications (useful for testing)
SessionStorageManager.resetNotifications();
```

### 2. useNotification Hook
Custom hook để quản lý notification state dễ dàng hơn.

```typescript
import { useNotification } from '@/hooks/useNotification';

const MyComponent = () => {
  const { isVisible, dismiss, reset } = useNotification('DEMO_BANNER_DISMISSED');
  
  if (!isVisible) return null;
  
  return (
    <div>
      <button onClick={dismiss}>Dismiss</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
```

### 3. Available Notification Keys
```typescript
export const SessionStorageKeys = {
  DEMO_BANNER_DISMISSED: 'demo-banner-dismissed',
  SOV_TOKEN_BANNER_DISMISSED: 'sov-token-banner-dismissed',
  WELCOME_NOTIFICATION_SHOWN: 'welcome-notification-shown',
  RANK_UPGRADE_SHOWN: 'rank-upgrade-shown',
  PAYMENT_SUCCESS_SHOWN: 'payment-success-shown'
} as const;
```

## Usage Examples

### 1. Demo Banner
```typescript
const DemoBanner = () => {
  const { isVisible, dismiss } = useNotification('DEMO_BANNER_DISMISSED');
  
  if (!isVisible) return null;
  
  return (
    <div>
      <button onClick={dismiss}>×</button>
      Demo Mode Active
    </div>
  );
};
```

### 2. SOV Token Banner
```typescript
const SOVTokenBanner = () => {
  const { isVisible, dismiss } = useNotification('SOV_TOKEN_BANNER_DISMISSED');
  
  if (!isVisible) return null;
  
  return (
    <div>
      <button onClick={dismiss}>×</button>
      SOV Tokens Ready!
    </div>
  );
};
```

### 3. Welcome Notification
```typescript
const UserRankDisplay = () => {
  const { isVisible } = useNotification('WELCOME_NOTIFICATION_SHOWN');
  
  useEffect(() => {
    if (isVisible && userRank) {
      toast.success(`Welcome back, ${userRank.name} member!`);
    }
  }, [isVisible, userRank]);
  
  return <div>...</div>;
};
```

## Features

### ✅ One-time Display
- Notifications chỉ hiển thị một lần trong mỗi session
- Sử dụng sessionStorage để lưu trạng thái
- Tự động reset khi đóng browser

### ✅ Easy Management
- Centralized utility functions
- Custom hook for easy state management
- Type-safe notification keys

### ✅ Testing Support
- Reset function để test notifications
- Clear all notifications function
- Consistent behavior across components

## Best Practices

1. **Sử dụng useNotification hook** thay vì trực tiếp quản lý sessionStorage
2. **Đặt tên key rõ ràng** để dễ quản lý
3. **Reset notifications** trong development mode
4. **Test thoroughly** để đảm bảo notifications hoạt động đúng

## Migration Guide

### Before (Old Way)
```typescript
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const wasDismissed = sessionStorage.getItem('banner-dismissed');
  if (!wasDismissed) {
    setIsVisible(true);
  }
}, []);

const handleDismiss = () => {
  setIsVisible(false);
  sessionStorage.setItem('banner-dismissed', 'true');
};
```

### After (New Way)
```typescript
const { isVisible, dismiss } = useNotification('BANNER_DISMISSED');

const handleDismiss = () => {
  dismiss();
};
```

## Troubleshooting

### Notifications showing multiple times
- Kiểm tra xem có sử dụng đúng key không
- Đảm bảo không có duplicate components
- Reset sessionStorage nếu cần

### Notifications not showing
- Kiểm tra sessionStorage có bị clear không
- Đảm bảo component được render
- Check console for errors

### Testing notifications
```typescript
// Reset all notifications
SessionStorageManager.resetNotifications();

// Reset specific notification
SessionStorageManager.remove(SessionStorageKeys.DEMO_BANNER_DISMISSED);
```
