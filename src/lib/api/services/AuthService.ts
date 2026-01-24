/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { BaseService } from '../BaseService';
import { setAuthToken, setRefreshToken, clearTokens } from '../tokens';
import {
  RegisterData,
  LoginData,
  AuthResponse,
  OTPResponse,
  TokenResponse,
  MessageResponse,
  SocialProvider,
  VerifyOTPData,
  ForgotPasswordData,
  ResetPasswordData,
} from '@/types/auth';
import { User } from '@/types';
import { ApiResponse } from '../types';

class AuthServiceClass extends BaseService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );

    if (response.data.accessToken && response.data.refreshToken) {
      setAuthToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Login with email and password
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );

    if (response.data.accessToken && response.data.refreshToken) {
      setAuthToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Send OTP to email address
   */
  async sendOTP(email: string): Promise<OTPResponse> {
    const response = await this.post<ApiResponse<OTPResponse>>(
      '/auth/otp/send',
      { email }
    );
    return response.data;
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    const response = await this.post<ApiResponse<AuthResponse>>(
      '/auth/otp/verify',
      { email, otp }
    );

    if (response.data.accessToken && response.data.refreshToken) {
      setAuthToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Social login (Google, Facebook, Apple)
   */
  async socialLogin(provider: SocialProvider, token: string): Promise<AuthResponse> {
    const response = await this.post<ApiResponse<AuthResponse>>(
      `/auth/social/${provider}`,
      { token }
    );

    if (response.data.accessToken && response.data.refreshToken) {
      setAuthToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<MessageResponse> {
    const response = await this.post<ApiResponse<MessageResponse>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<MessageResponse> {
    const response = await this.post<ApiResponse<MessageResponse>>(
      '/auth/reset-password',
      { email, otp, newPassword }
    );
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.post<ApiResponse<TokenResponse>>(
      '/auth/refresh-token',
      { refreshToken }
    );

    if (response.data.accessToken && response.data.refreshToken) {
      setAuthToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      clearTokens();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data.user;
  }

  /**
   * Delete user account permanently
   */
  async deleteAccount(): Promise<void> {
    await this.delete('/users/me');
    clearTokens();
  }
}

export const AuthService = new AuthServiceClass();
export default AuthService;
