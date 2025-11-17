/**
 * API Type Definitions
 * Defines the structure of API requests and responses
 */

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
