/**
 * Token Refresh Logic
 * Handles refreshing expired access tokens
 */

import axios from 'axios';
import { API_BASE_URL } from './config';
import {
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
  clearTokens,
} from './tokens';
import { RefreshTokenResponse } from './types';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('لا يوجد رمز تحديث');
  }

  if (isRefreshing) {
    return new Promise<string>((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    setAuthToken(accessToken);
    setRefreshToken(newRefreshToken);

    isRefreshing = false;
    onTokenRefreshed(accessToken);

    return accessToken;
  } catch (error) {
    isRefreshing = false;
    clearTokens();
    window.location.href = '/login';
    throw error;
  }
}
