/**
 * Admin Content Service
 * API service for managing categories, tracks, and programs
 */

import apiClient from '../../client';
import { Category, Track, Program } from '@/types';

export interface CreateCategoryData {
  name: string;
  icon: string;
  color: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CreateTrackData {
  title: string;
  description?: string;
  category: string;
  level: string;
  relaxationType?: string;
  imageUrl: string;
  audioUrl: string;
  duration?: number;
  isPremium?: boolean;
  isActive?: boolean;
}

export interface UpdateTrackData extends Partial<CreateTrackData> {}

export interface CreateProgramData {
  title: string;
  description?: string;
  category: string;
  level: string;
  thumbnailImages: string[];
  trackIds: string[];
  isPremium?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateProgramData extends Partial<CreateProgramData> {}

export interface FileUploadResponse {
  url: string;
  filename: string;
  duration?: number;
}

export interface ContentStats {
  totalCategories: number;
  totalTracks: number;
  totalPrograms: number;
  tracksThisMonth: number;
  programsThisMonth: number;
  mostPlayedTracks: Array<{
    id: string;
    title: string;
    plays: number;
  }>;
}

export class AdminContentService {
  /**
   * Categories Management
   */
  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/admin/categories');
    return response.data?.categories || response.data || [];
  }

  static async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post('/admin/categories', data);
    return response.data?.category || response.data;
  }

  static async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    return response.data?.category || response.data;
  }

  static async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/admin/categories/${id}`);
  }

  /**
   * Tracks Management
   */
  static async getTracks(params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    isPremium?: boolean;
    search?: string;
  }): Promise<{ tracks: Track[]; total: number; page: number; totalPages: number }> {
    const response = await apiClient.get('/admin/tracks', { params });
    return {
      tracks: response.data?.tracks || response.data || [],
      total: response.data?.total || 0,
      page: response.data?.page || 1,
      totalPages: response.data?.totalPages || 1,
    };
  }

  static async getTrack(id: string): Promise<Track> {
    const response = await apiClient.get(`/admin/tracks/${id}`);
    return response.data?.track || response.data;
  }

  static async createTrack(data: CreateTrackData): Promise<Track> {
    const response = await apiClient.post('/admin/tracks', data);
    return response.data?.track || response.data;
  }

  static async updateTrack(id: string, data: UpdateTrackData): Promise<Track> {
    const response = await apiClient.put(`/admin/tracks/${id}`, data);
    return response.data?.track || response.data;
  }

  static async deleteTrack(id: string): Promise<void> {
    await apiClient.delete(`/admin/tracks/${id}`);
  }

  /**
   * Programs Management
   */
  static async getPrograms(params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    isPremium?: boolean;
    search?: string;
  }): Promise<{ programs: Program[]; total: number; page: number; totalPages: number }> {
    const response = await apiClient.get('/admin/programs', { params });
    return {
      programs: response.data?.programs || response.data || [],
      total: response.data?.total || 0,
      page: response.data?.page || 1,
      totalPages: response.data?.totalPages || 1,
    };
  }

  static async getProgram(id: string): Promise<Program> {
    const response = await apiClient.get(`/admin/programs/${id}`);
    return response.data?.program || response.data;
  }

  static async createProgram(data: CreateProgramData): Promise<Program> {
    const response = await apiClient.post('/admin/programs', data);
    return response.data?.program || response.data;
  }

  static async updateProgram(id: string, data: UpdateProgramData): Promise<Program> {
    const response = await apiClient.put(`/admin/programs/${id}`, data);
    return response.data?.program || response.data;
  }

  static async deleteProgram(id: string): Promise<void> {
    await apiClient.delete(`/admin/programs/${id}`);
  }

  /**
   * File Upload
   */
  static async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file); // Backend expects 'file' as field name
    formData.append('category', 'track'); // Default category, can be track/program/category/avatar

    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return {
      url: response.data?.data?.imageUrl || response.data?.imageUrl || '',
      filename: response.data?.data?.key || '',
    };
  }

  static async uploadAudio(file: File, onProgress?: (progress: number) => void): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file); // Backend expects 'file' as field name
    // Note: trackId should be passed when uploading audio, but for now we'll handle it differently

    const response = await apiClient.post('/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return {
      url: response.data?.data?.audioUrl || response.data?.audioUrl || '',
      filename: response.data?.data?.key || '',
      duration: response.data?.data?.duration,
    };
  }

  /**
   * Content Statistics
   */
  static async getContentStats(): Promise<ContentStats> {
    const response = await apiClient.get('/admin/content/stats');
    return response.data;
  }
}

export default AdminContentService;
