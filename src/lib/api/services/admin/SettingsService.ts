/**
 * Admin Settings Service
 * API service for managing admin settings
 */

import apiClient from '../../client';

export interface AdminProfile {
  name: string;
  email: string;
  phone?: string;
}

export interface Settings {
  storageType: 'local' | 'r2';
  adminProfile: AdminProfile;
  r2Config?: {
    isConfigured: boolean;
  };
  localStoragePath?: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateStorageData {
  storageType: 'local' | 'r2';
}

export class AdminSettingsService {
  /**
   * Get current settings
   */
  static async getSettings(): Promise<Settings> {
    const response = await apiClient.get('/admin/settings');
    return response.data?.data || response.data;
  }

  /**
   * Update admin profile
   */
  static async updateProfile(data: UpdateProfileData): Promise<{ adminProfile: AdminProfile }> {
    const response = await apiClient.put('/admin/settings/profile', data);
    return response.data?.data || response.data;
  }

  /**
   * Change admin password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.put('/admin/settings/password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  }

  /**
   * Update storage settings
   */
  static async updateStorageType(data: UpdateStorageData): Promise<{ storageType: 'local' | 'r2' }> {
    const response = await apiClient.put('/admin/settings/storage', data);
    return response.data?.data || response.data;
  }

  /**
   * Initialize default settings
   */
  static async initializeSettings(): Promise<Settings> {
    const response = await apiClient.post('/admin/settings/initialize');
    return response.data?.data || response.data;
  }
}

export default AdminSettingsService;
