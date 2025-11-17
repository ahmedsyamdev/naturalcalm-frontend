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
   * Login with phone and password
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
   * Send OTP to phone number
   */
  async sendOTP(phone: string): Promise<OTPResponse> {
    const response = await this.post<ApiResponse<OTPResponse>>(
      '/auth/otp/send',
      { phone }
    );
    return response.data;
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(phone: string, code: string): Promise<AuthResponse> {
    const response = await this.post<ApiResponse<AuthResponse>>(
      '/auth/otp/verify',
      { phone, otp: code }
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
  async forgotPassword(phone: string): Promise<MessageResponse> {
    const response = await this.post<ApiResponse<MessageResponse>>(
      '/auth/forgot-password',
      { phone }
    );
    return response.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
    const response = await this.post<ApiResponse<MessageResponse>>(
      '/auth/reset-password',
      { token, newPassword }
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
}

export const AuthService = new AuthServiceClass();
export default AuthService;
