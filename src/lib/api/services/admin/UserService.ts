/**
 * Admin User Service
 * API service for managing users
 */

import apiClient from '../../client';

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isBanned?: boolean;
  banReason?: string;
  banUntil?: string;
  subscription?: {
    type?: 'free' | 'basic' | 'premium';
    status?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    daysRemaining?: number;
    autoRenew?: boolean;
  };
  stats?: {
    totalListeningTime: number;
    favoritesCount?: number;
    favoriteTracks?: number;
    favoritePrograms?: number;
    enrolledPrograms: number;
    completedPrograms?: number;
    totalPayments?: number;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface ListeningSession {
  id: string;
  track: {
    id: string;
    title: string;
    imageUrl?: string;
  };
  duration: number;
  completed: boolean;
  createdAt: string;
}

export interface SubscriptionHistory {
  id: string;
  package: {
    id: string;
    name: string;
    type: 'basic' | 'premium';
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentMethod?: string;
  amount?: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin';
  isVerified?: boolean;
  subscription?: 'free' | 'basic' | 'premium' | 'expired';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersListResponse {
  users: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EnrolledProgram {
  id: string;
  _id?: string;
  program: {
    id?: string;
    _id?: string;
    title: string;
    imageUrl?: string;
    category?: string;
  };
  enrolledAt: string;
  progress?: number;
  completedSessions?: number;
  totalSessions?: number;
  status?: 'active' | 'completed' | 'paused';
}

export interface FavoriteItem {
  id: string;
  _id?: string;
  type: 'track' | 'program';
  item: {
    id?: string;
    _id?: string;
    title: string;
    imageUrl?: string;
    category?: string;
    duration?: number;
  };
  addedAt: string;
}

export interface UserDetailsResponse extends AdminUser {
  recentActivity?: ListeningSession[];
  subscriptionHistory?: SubscriptionHistory[];
  enrolledPrograms?: EnrolledProgram[];
  favorites?: FavoriteItem[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  isVerified?: boolean;
}

export interface GrantSubscriptionData {
  packageId: string;
  durationDays: number;
  reason?: string;
}

export interface BanUserData {
  reason: string;
  duration?: number;
  permanent?: boolean;
}

export class AdminUserService {
  /**
   * Get users list with filters
   */
  static async getUsers(filters?: UserFilters): Promise<UsersListResponse> {
    const response = await apiClient.get('/admin/users', { params: filters });
    return response.data;
  }

  /**
   * Get user details by ID
   */
  static async getUserDetails(userId: string): Promise<UserDetailsResponse> {
    const response = await apiClient.get(`/admin/users/${userId}`);
    const data = response.data?.data || response.data;

    // Merge user with stats and other data from the response
    const user = data.user || data;

    // Add id field from _id if not present
    if (!user.id && user._id) {
      user.id = user._id;
    }

    // Merge stats into user object if they're separate
    if (data.stats) {
      user.stats = data.stats;
    }

    // Add recentActivity if available
    if (data.recentActivity) {
      user.recentActivity = data.recentActivity;
    }

    // Add subscriptionHistory if available
    if (data.subscriptionHistory) {
      user.subscriptionHistory = data.subscriptionHistory;
    }

    // Add enrolledPrograms if available
    if (data.enrolledPrograms) {
      user.enrolledPrograms = data.enrolledPrograms;
    }

    // Add favorites if available
    if (data.favorites) {
      user.favorites = data.favorites;
    }

    return user;
  }

  /**
   * Update user information
   */
  static async updateUser(userId: string, data: UpdateUserData): Promise<AdminUser> {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data?.user || response.data;
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  }

  /**
   * Grant subscription manually
   */
  static async grantSubscription(userId: string, data: GrantSubscriptionData): Promise<AdminUser> {
    const response = await apiClient.post(`/admin/users/${userId}/grant-subscription`, data);
    return response.data?.user || response.data;
  }

  /**
   * Ban user
   */
  static async banUser(userId: string, data: BanUserData): Promise<AdminUser> {
    const response = await apiClient.post(`/admin/users/${userId}/ban`, data);
    return response.data?.user || response.data;
  }

  /**
   * Unban user
   */
  static async unbanUser(userId: string): Promise<AdminUser> {
    const response = await apiClient.post(`/admin/users/${userId}/unban`);
    return response.data?.user || response.data;
  }

  /**
   * Export user data (GDPR)
   */
  static async exportUserData(userId: string): Promise<Blob> {
    // Fetch the user data as JSON
    const response = await apiClient.get(`/admin/users/${userId}/export`);

    // Convert response data to JSON string
    const jsonStr = JSON.stringify(response.data, null, 2);

    // Create and return blob
    return new Blob([jsonStr], { type: 'application/json' });
  }

  /**
   * Get user statistics summary
   */
  static async getUserStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    premiumUsers: number;
    newUsersThisMonth: number;
    bannedUsers: number;
  }> {
    const response = await apiClient.get('/admin/users/stats');
    return response.data;
  }
}

export default AdminUserService;
