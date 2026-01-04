/**
 * Authentication Type Definitions
 * Defines types for authentication requests and responses
 */

import { User } from './index';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
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
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}
