/**
 * Favorites Service
 * Handles API calls for user favorites (tracks and programs)
 */

import { BaseService } from '../BaseService';
import { Track, Program } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class FavoritesServiceClass extends BaseService {
  async getFavoriteTracks(): Promise<Track[]> {
    const response = await this.get<ApiResponse<Track[]>>('/users/favorites/tracks');
    return response.data;
  }

  async getFavoritePrograms(): Promise<Program[]> {
    const response = await this.get<ApiResponse<Program[]>>('/users/favorites/programs');
    return response.data;
  }

  async addTrackToFavorites(trackId: string): Promise<void> {
    await this.post<ApiResponse<void>>(`/users/favorites/tracks/${trackId}`);
  }

  async removeTrackFromFavorites(trackId: string): Promise<void> {
    await this.delete<ApiResponse<void>>(`/users/favorites/tracks/${trackId}`);
  }

  async addProgramToFavorites(programId: string): Promise<void> {
    await this.post<ApiResponse<void>>(`/users/favorites/programs/${programId}`);
  }

  async removeProgramFromFavorites(programId: string): Promise<void> {
    await this.delete<ApiResponse<void>>(`/users/favorites/programs/${programId}`);
  }
}

export const FavoritesService = new FavoritesServiceClass();
