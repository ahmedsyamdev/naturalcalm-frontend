/**
 * Authentication Type Definitions
 * Defines types for authentication requests and responses
 */

import { User } from './index';

export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  invitationCode?: string;
}

export interface LoginData {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OTPResponse {
  message: string;
  expiresIn: number;
  retryAfter?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface SocialLoginData {
  provider: SocialProvider;
  token: string;
}

export interface ForgotPasswordData {
  phone: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface VerifyOTPData {
  phone: string;
  code: string;
}
