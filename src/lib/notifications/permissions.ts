/**
 * Browser Notification Permissions Utility
 * Handles checking and requesting notification permissions
 */

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Check if browser supports notifications
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Get current notification permission state
 */
export const getNotificationPermission = (): NotificationPermissionState => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
};

/**
 * Request notification permission from user
 * @returns Promise with permission state
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();

    // Store permission state in localStorage for tracking
    localStorage.setItem('notification_permission_requested', 'true');
    localStorage.setItem('notification_permission_state', permission);

    return permission as NotificationPermissionState;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Check if permission has been requested before
 */
export const hasRequestedPermission = (): boolean => {
  return localStorage.getItem('notification_permission_requested') === 'true';
};

/**
 * Send a test browser notification
 */
export const sendTestNotification = (title: string, body: string, icon?: string): void => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'naturacalm-notification',
      requireInteraction: false,
      silent: false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Get user-friendly message based on permission state
 */
export const getPermissionMessage = (state: NotificationPermissionState): string => {
  switch (state) {
    case 'granted':
      return 'تم تفعيل الإشعارات بنجاح';
    case 'denied':
      return 'تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح';
    case 'default':
      return 'لم يتم طلب إذن الإشعارات بعد';
    case 'unsupported':
      return 'متصفحك لا يدعم الإشعارات';
    default:
      return 'حالة غير معروفة';
  }
};

/**
 * Get instructions for re-enabling notifications based on browser
 */
export const getReEnableInstructions = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('chrome')) {
    return 'لتفعيل الإشعارات في Chrome:\n1. انقر على أيقونة القفل بجانب عنوان الموقع\n2. ابحث عن "الإشعارات"\n3. اختر "السماح"';
  } else if (userAgent.includes('firefox')) {
    return 'لتفعيل الإشعارات في Firefox:\n1. انقر على أيقونة القفل بجانب عنوان الموقع\n2. ابحث عن "الإشعارات"\n3. احذف الحظر وأعد تحميل الصفحة';
  } else if (userAgent.includes('safari')) {
    return 'لتفعيل الإشعارات في Safari:\n1. افتح تفضيلات Safari\n2. اذهب إلى "المواقع"\n3. اختر "الإشعارات"\n4. ابحث عن موقعنا وغير الإعداد إلى "السماح"';
  } else {
    return 'لتفعيل الإشعارات:\n1. افتح إعدادات المتصفح\n2. ابحث عن إعدادات الإشعارات\n3. اسمح للموقع بإرسال الإشعارات';
  }
};
