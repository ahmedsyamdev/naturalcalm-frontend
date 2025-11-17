/**
 * Admin Notification Service
 * Handles API calls for admin notification management
 */

import { BaseService } from '../BaseService';

export interface NotificationTemplate {
  id: string;
  name: string;
  key: string;
}

export interface NotificationStats {
  totalNotifications: number;
  notificationsToday: number;
  notificationsLast30Days: number;
  notificationsByType: Array<{ _id: string; count: number }>;
  readRate: number;
  notificationsPerDay: Array<{ _id: string; count: number }>;
  fcmStats: {
    totalUsers: number;
    usersWithTokens: number;
    totalTokens: number;
    averageTokensPerUser: number;
    pushOptInRate: number;
  };
}

export interface SendNotificationRequest {
  userId: string;
  type: 'new_content' | 'achievement' | 'reminder' | 'subscription' | 'system';
  title: string;
  message: string;
  icon?: string;
  imageUrl?: string;
  data?: Record<string, unknown>;
  sendPush?: boolean;
}

export interface BroadcastNotificationRequest {
  type: 'new_content' | 'achievement' | 'reminder' | 'subscription' | 'system';
  title: string;
  message: string;
  icon?: string;
  imageUrl?: string;
  data?: Record<string, unknown>;
  targetUsers?: string[];
  subscribersOnly?: boolean;
  sendPush?: boolean;
}

export interface BroadcastResponse {
  count: number;
  userCount: number;
  pushSent: boolean;
}

export interface UserForNotification {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  subscription?: {
    status: 'active' | 'expired' | 'trial';
  };
}

export interface TrackForNotification {
  _id: string;
  title: string;
  imageUrl?: string;
  category: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
}

export interface ProgramForNotification {
  _id: string;
  title: string;
  thumbnailImages?: string[];
  category: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
}

export interface NotificationHistoryItem {
  _id: string;
  title: string;
  message: string;
  type: 'new_content' | 'achievement' | 'reminder' | 'subscription' | 'system';
  icon?: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  isBroadcast: boolean;
  recipientCount: number;
  recipient?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  sampleRecipients?: Array<{
    _id: string;
    name: string;
  }>;
  data?: Record<string, unknown>;
}

export interface NotificationHistoryResponse {
  notifications: NotificationHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class AdminNotificationServiceClass extends BaseService {
  /**
   * Get all available notification templates
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await this.get<ApiResponse<{ templates: NotificationTemplate[]; count: number }>>(
      '/admin/notifications/templates'
    );
    return response.data.templates;
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    const response = await this.get<ApiResponse<NotificationStats>>(
      '/admin/notifications/stats'
    );
    return response.data;
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(data: SendNotificationRequest): Promise<void> {
    await this.post<ApiResponse<void>>('/admin/notifications/send', data);
  }

  /**
   * Broadcast notification to all users or specific groups
   */
  async broadcast(data: BroadcastNotificationRequest): Promise<BroadcastResponse> {
    const response = await this.post<ApiResponse<BroadcastResponse>>(
      '/admin/notifications/broadcast',
      data
    );
    return response.data;
  }

  /**
   * Get notification history with pagination
   */
  async getHistory(page = 1, limit = 50, type?: string): Promise<NotificationHistoryResponse> {
    const params: Record<string, any> = { page, limit };
    if (type && type !== 'all') {
      params.type = type;
    }
    const response = await this.get<ApiResponse<NotificationHistoryResponse>>(
      '/admin/notifications/history',
      { params }
    );
    return response.data;
  }

  /**
   * Get users list for notification dropdown
   */
  async getUsers(search?: string): Promise<UserForNotification[]> {
    const params = search ? { search } : {};
    const response = await this.get<ApiResponse<{ users: UserForNotification[]; count: number }>>(
      '/admin/notifications/users',
      { params }
    );
    return response.data.users;
  }

  /**
   * Get tracks list for linking to notifications
   */
  async getTracks(search?: string): Promise<TrackForNotification[]> {
    const params = search ? { search } : {};
    const response = await this.get<ApiResponse<{ tracks: TrackForNotification[]; count: number }>>(
      '/admin/notifications/tracks',
      { params }
    );
    return response.data.tracks;
  }

  /**
   * Get programs list for linking to notifications
   */
  async getPrograms(search?: string): Promise<ProgramForNotification[]> {
    const params = search ? { search } : {};
    const response = await this.get<ApiResponse<{ programs: ProgramForNotification[]; count: number }>>(
      '/admin/notifications/programs',
      { params }
    );
    return response.data.programs;
  }
}

export const AdminNotificationService = new AdminNotificationServiceClass();
