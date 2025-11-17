/**
 * Audio Service
 * Handles audio streaming URLs and listening session tracking
 */

import { BaseService } from '../BaseService';
import {
  StreamResponse,
  ListeningSession,
  SessionUpdate,
  SessionStartRequest,
  SessionEndRequest,
} from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class AudioServiceClass extends BaseService {
  /**
   * Get signed streaming URL for a track
   * @param trackId - The ID of the track to stream
   * @returns StreamResponse with signed URL and expiration
   */
  async getStreamUrl(trackId: string): Promise<StreamResponse> {
    const response = await this.get<ApiResponse<StreamResponse>>(
      `/tracks/${trackId}/stream`
    );
    return response.data;
  }

  /**
   * Start a new listening session
   * @param data - Session start data (trackId, optional programId)
   * @returns The created listening session
   */
  async startSession(data: SessionStartRequest): Promise<ListeningSession> {
    const response = await this.post<ApiResponse<ListeningSession>>(
      '/users/listening-sessions',
      data
    );
    return response.data;
  }

  /**
   * Update an existing listening session
   * @param sessionId - The ID of the session to update
   * @param data - Session update data (currentTime, duration)
   */
  async updateSession(sessionId: string, data: SessionUpdate): Promise<void> {
    await this.put<ApiResponse<void>>(
      `/users/listening-sessions/${sessionId}`,
      data
    );
  }

  /**
   * End a listening session
   * @param sessionId - The ID of the session to end
   * @param data - Session end data (completed status)
   */
  async endSession(sessionId: string, data: SessionEndRequest): Promise<void> {
    await this.post<ApiResponse<void>>(
      `/users/listening-sessions/${sessionId}/end`,
      data
    );
  }

  /**
   * Get user's listening history
   * @param limit - Optional limit for number of sessions to return
   * @returns Array of listening sessions
   */
  async getListeningSessions(limit?: number): Promise<ListeningSession[]> {
    const response = await this.get<ApiResponse<ListeningSession[]>>(
      '/users/listening-sessions',
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Get listening stats for a specific track
   * @param trackId - The ID of the track
   * @returns Session statistics
   */
  async getTrackStats(trackId: string): Promise<{
    totalListens: number;
    totalMinutes: number;
    completionRate: number;
  }> {
    const response = await this.get<ApiResponse<{
      totalListens: number;
      totalMinutes: number;
      completionRate: number;
    }>>(`/tracks/${trackId}/stats`);
    return response.data;
  }
}

export const AudioService = new AudioServiceClass();
