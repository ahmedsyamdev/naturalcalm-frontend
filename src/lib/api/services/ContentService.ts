/**
 * Content Service
 * Handles API calls for categories, tracks, and programs
 */

import { BaseService } from '../BaseService';
import { Category, Track, Program } from '@/types';
import { TrackFilters, ProgramFilters } from '@/types/filters';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ContentServiceClass extends BaseService {
  async getCategories(): Promise<Category[]> {
    const response = await this.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  async getTracks(filters?: TrackFilters): Promise<Track[]> {
    const response = await this.get<ApiResponse<Track[]>>('/tracks', {
      params: filters,
    });
    return response.data;
  }

  async getTrackById(id: string): Promise<Track> {
    const response = await this.get<ApiResponse<Track>>(`/tracks/${id}`);
    return response.data;
  }

  async getFeaturedTracks(): Promise<Track[]> {
    const response = await this.get<ApiResponse<Track[]>>('/tracks/featured');
    return response.data;
  }

  async getTracksByCategory(categoryId: string): Promise<Track[]> {
    const response = await this.get<ApiResponse<Track[]>>(`/categories/${categoryId}/tracks`);
    return response.data;
  }

  async getPrograms(filters?: ProgramFilters): Promise<Program[]> {
    const response = await this.get<ApiResponse<Program[]>>('/programs', {
      params: filters,
    });
    return response.data;
  }

  async getProgramById(id: string): Promise<Program> {
    const response = await this.get<ApiResponse<Program>>(`/programs/${id}`);
    return response.data;
  }

  async getProgramTracks(programId: string): Promise<Track[]> {
    const response = await this.get<ApiResponse<Track[]>>(`/programs/${programId}/tracks`);
    return response.data;
  }

  async getFeaturedPrograms(): Promise<Program[]> {
    const response = await this.get<ApiResponse<Program[]>>('/programs/featured');
    return response.data;
  }

  async getProgramsByCategory(categoryId: string): Promise<Program[]> {
    const response = await this.get<ApiResponse<Program[]>>(`/categories/${categoryId}/programs`);
    return response.data;
  }
}

export const ContentService = new ContentServiceClass();
