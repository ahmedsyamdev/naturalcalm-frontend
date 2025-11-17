/**
 * User Programs Service
 * Handles API calls for user's enrolled programs, custom programs, and progress tracking
 */

import { BaseService } from '../BaseService';
import { Program, CustomProgram } from '@/types';
import { ProgramProgress } from '@/types/progress';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class UserProgramsServiceClass extends BaseService {
  async getEnrolledPrograms(): Promise<Program[]> {
    const response = await this.get<ApiResponse<Program[]>>('/users/programs');
    return response.data;
  }

  async getCustomPrograms(): Promise<CustomProgram[]> {
    const response = await this.get<ApiResponse<CustomProgram[]>>('/users/programs/custom');
    return response.data;
  }

  async enrollInProgram(programId: string): Promise<void> {
    await this.post<ApiResponse<void>>(`/users/programs/${programId}/enroll`);
  }

  async getProgramProgress(programId: string): Promise<ProgramProgress> {
    const response = await this.get<ApiResponse<ProgramProgress>>(
      `/users/programs/${programId}/progress`
    );
    return response.data;
  }

  async markTrackComplete(programId: string, trackId: string): Promise<void> {
    await this.post<ApiResponse<void>>(
      `/users/programs/${programId}/tracks/${trackId}/complete`
    );
  }

  async createCustomProgram(name: string, trackIds: string[]): Promise<CustomProgram> {
    const response = await this.post<ApiResponse<CustomProgram>>(
      '/users/programs/custom',
      { name, trackIds }
    );
    return response.data;
  }

  async updateCustomProgram(
    id: string,
    data: Partial<CustomProgram>
  ): Promise<CustomProgram> {
    const response = await this.put<ApiResponse<CustomProgram>>(
      `/users/programs/custom/${id}`,
      data
    );
    return response.data;
  }

  async getCustomProgramById(id: string): Promise<CustomProgram> {
    const response = await this.get<ApiResponse<CustomProgram>>(
      `/users/programs/custom/${id}`
    );
    return response.data;
  }

  async deleteCustomProgram(id: string): Promise<void> {
    await this.delete<ApiResponse<void>>(`/users/programs/custom/${id}`);
  }
}

export const UserProgramsService = new UserProgramsServiceClass();
