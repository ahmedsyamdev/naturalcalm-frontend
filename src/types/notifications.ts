/**
 * Notification Types
 * Defines the structure of notifications in the app
 */

export type NotificationType =
  | 'new_content'
  | 'achievement'
  | 'reminder'
  | 'subscription'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    trackId?: string;
    programId?: string;
    action?: string;
    url?: string;
    [key: string]: unknown;
  };
}

// Alias for backward compatibility
export type Notification = AppNotification;

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: NotificationType[];
}

export interface UnreadCountResponse {
  count: number;
}
