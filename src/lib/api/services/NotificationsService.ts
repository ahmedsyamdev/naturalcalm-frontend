/**
 * Notifications Service
 * Handles API calls for notifications
 */

import { BaseService } from '../BaseService';
import { Notification, NotificationPreferences, UnreadCountResponse } from '@/types/notifications';
import { ApiResponse, PaginatedResponse } from '../types';

class NotificationsServiceClass extends BaseService {
  /**
   * Get paginated notifications
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Notification>> {
    const response = await this.get<ApiResponse<{
      notifications: Array<any>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>('/notifications', {
      params: { page, limit },
    });

    // Transform backend response to match PaginatedResponse structure
    // Also map _id to id for MongoDB compatibility
    const notifications: Notification[] = response.data.notifications.map((notif: any) => ({
      id: notif._id || notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      icon: notif.icon,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
      data: notif.data,
    }));

    return {
      data: notifications,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.get<ApiResponse<UnreadCountResponse>>('/notifications/unread-count');
    return response.data.count;
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.put<ApiResponse<void>>(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.put<ApiResponse<void>>('/notifications/mark-all-read');
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.delete<ApiResponse<void>>(`/notifications/${notificationId}`);
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
    return response.data;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await this.put<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
      preferences
    );
    return response.data;
  }

  /**
   * Register device for push notifications (FCM)
   */
  async registerDevice(token: string): Promise<void> {
    await this.post<ApiResponse<void>>('/notifications/register-device', { token });
  }
}

export const NotificationsService = new NotificationsServiceClass();
