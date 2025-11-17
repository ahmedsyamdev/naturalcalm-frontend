/**
 * Firebase Cloud Messaging (FCM) Utilities
 * Handles push notification token management and message handling
 */

import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { getFirebaseMessaging, vapidKey, isFirebaseConfigured } from './config';
import { NotificationsService } from '@/lib/api/services/NotificationsService';
import { showNotificationToast } from '@/components/NotificationToast';
import type { AppNotification } from '@/types/notifications';

/**
 * Request notification permission and get FCM token
 * @returns FCM token or null if failed
 */
export const requestFCMToken = async (): Promise<string | null> => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping FCM token request');
    return null;
  }

  try {
    // Get messaging instance
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('Firebase Messaging not available');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey });
    console.log('FCM token received:', token);

    // Send token to backend
    try {
      await NotificationsService.registerDevice(token);
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
    }

    // Store token in localStorage for reference
    localStorage.setItem('fcm_token', token);

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Get stored FCM token from localStorage
 */
export const getStoredFCMToken = (): string | null => {
  return localStorage.getItem('fcm_token');
};

/**
 * Transform FCM message payload to AppNotification type
 */
const transformFCMPayload = (payload: MessagePayload): AppNotification | null => {
  try {
    const data = payload.data || {};
    const notification = payload.notification || {};

    return {
      id: data.notificationId || `fcm-${Date.now()}`,
      type: (data.type as any) || 'system',
      title: notification.title || data.title || 'إشعار جديد',
      message: notification.body || data.message || '',
      icon: data.icon || notification.icon,
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {
        trackId: data.trackId,
        programId: data.programId,
        url: data.url,
        action: data.action,
      },
    };
  } catch (error) {
    console.error('Error transforming FCM payload:', error);
    return null;
  }
};

/**
 * Setup foreground message handler
 * This handles messages when the app is in the foreground
 */
export const setupForegroundMessageHandler = async () => {
  if (!isFirebaseConfigured()) {
    return;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return;
    }

    // Handle incoming messages when app is in foreground
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);

      // Transform payload to Notification type
      const notification = transformFCMPayload(payload);
      if (!notification) {
        return;
      }

      // Show notification toast
      showNotificationToast(notification, undefined, true);
    });

    console.log('Foreground message handler setup complete');
  } catch (error) {
    console.error('Error setting up foreground message handler:', error);
  }
};

/**
 * Initialize FCM (call this on app startup)
 */
export const initializeFCM = async (): Promise<void> => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured, skipping FCM initialization');
    return;
  }

  try {
    // Setup foreground message handler
    await setupForegroundMessageHandler();

    // Check if we already have a token
    const storedToken = getStoredFCMToken();

    if (!storedToken) {
      // Request token if we don't have one
      // Note: This will trigger permission request
      console.log('No FCM token found, will request on user interaction');
    } else {
      console.log('FCM token already exists:', storedToken);
    }
  } catch (error) {
    console.error('Error initializing FCM:', error);
  }
};

/**
 * Manually trigger FCM token request
 * Call this when user explicitly enables push notifications
 */
export const enablePushNotifications = async (): Promise<boolean> => {
  const token = await requestFCMToken();
  return !!token;
};

/**
 * Delete FCM token (call on logout)
 */
export const deleteFCMToken = async (): Promise<void> => {
  try {
    // Remove from localStorage
    localStorage.removeItem('fcm_token');

    // TODO: Call backend to remove token from user's devices
    console.log('FCM token deleted');
  } catch (error) {
    console.error('Error deleting FCM token:', error);
  }
};
