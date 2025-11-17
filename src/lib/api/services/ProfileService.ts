/**
 * Profile Service
 * Handles all profile-related API calls
 */

import { BaseService } from '../BaseService';
import { ApiResponse, PaginatedResponse } from '../types';
import {
  User,
  UpdateProfileData,
  UserPreferences,
  AvatarUploadResponse,
  DeleteAccountRequest,
  ProgressStats,
  WeeklyData,
  Track,
  ListeningSession,
  InviteResponse,
} from '@/types';

interface BackendTrack {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  durationSeconds: number;
  level: string;
  category: string;
  audioUrl?: string;
  streamUrl?: string;
}

class ProfileServiceClass extends BaseService {
  /**
   * Transform backend track to frontend Track format
   */
  private transformTrack(backendTrack: BackendTrack): Track {
    const minutes = Math.floor(backendTrack.durationSeconds / 60);
    const seconds = backendTrack.durationSeconds % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')} د`;

    return {
      id: backendTrack.id || backendTrack._id || '',
      title: backendTrack.title,
      description: backendTrack.description,
      duration,
      plays: '0',
      level: backendTrack.level as any,
      category: backendTrack.category as any,
      imageUrl: backendTrack.imageUrl || '',
      audioUrl: backendTrack.audioUrl,
      streamUrl: backendTrack.streamUrl,
      isFavorite: false,
      isPremium: false,
    };
  }
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await this.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await this.put<ApiResponse<{ user: User }>>('/users/me', data);
    return response.data.user;
  }

  /**
   * Upload user avatar
   * Note: Backend requires admin role for file uploads
   * For now, avatar must be a URL
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    throw new Error('Avatar upload not implemented. Please provide avatar URL instead.');
  }

  /**
   * Update avatar URL
   */
  async updateAvatar(avatarUrl: string): Promise<User> {
    const response = await this.put<ApiResponse<{ user: User }>>('/users/me', { avatar: avatarUrl });
    return response.data.user;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: UserPreferences): Promise<User> {
    const response = await this.put<ApiResponse<{ user: User }>>('/users/me', { preferences });
    return response.data.user;
  }

  /**
   * Delete user account
   * Note: This endpoint doesn't exist yet in backend
   */
  async deleteAccount(password: string): Promise<void> {
    throw new Error('Delete account endpoint not implemented in backend yet.');
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<ProgressStats> {
    const response = await this.get<ApiResponse<Omit<ProgressStats, 'weeklyData'>>>('/users/stats');
    return {
      ...response.data,
      weeklyData: [],
    };
  }

  /**
   * Get weekly statistics for chart
   */
  async getWeeklyStats(): Promise<WeeklyData[]> {
    const response = await this.get<ApiResponse<WeeklyData[]>>(
      '/users/stats/weekly'
    );
    return response.data;
  }

  /**
   * Get recent tracks
   */
  async getRecentTracks(): Promise<Track[]> {
    const response = await this.get<ApiResponse<BackendTrack[]>>(
      '/users/history/recent'
    );
    return response.data.map(track => this.transformTrack(track));
  }

  /**
   * Get listening history with pagination
   */
  async getListeningHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ListeningSession>> {
    const response = await this.get<ApiResponse<{ sessions: ListeningSession[], pagination: any }>>(
      `/users/history?page=${page}&limit=${limit}`
    );

    return {
      data: response.data.sessions,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  }

  /**
   * Generate invite code and get referral link
   * Note: This endpoint doesn't exist yet in backend
   */
  async generateInvite(): Promise<InviteResponse> {
    throw new Error('Invite feature not implemented in backend yet.');
  }
}

export const ProfileService = new ProfileServiceClass();
export default ProfileService;
