/**
 * API Configuration
 * Centralizes API-related configuration settings
 */

import { API_URL } from '@/lib/config';

export const API_BASE_URL = API_URL;
export const API_TIMEOUT = 30000; // 30 seconds

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
  },
};
