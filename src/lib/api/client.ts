/**
 * Axios API Client
 * Configured axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from './config';
import { getAuthToken, clearTokens } from './tokens';
import { refreshAccessToken } from './refresh';
import { handleApiError } from './errors';
import { toast } from '@/hooks/use-toast';

const apiClient = axios.create(apiConfig);

let isRetrying = false;

/**
 * Recursively transforms _id to id in API responses
 * This handles MongoDB's default _id field
 */
function transformMongoId(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(transformMongoId);
  }

  if (typeof data === 'object') {
    const transformed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === '_id') {
        transformed.id = typeof value === 'object' && value !== null ? String(value) : value;
      } else {
        transformed[key] = transformMongoId(value);
      }
    }

    return transformed;
  }

  return data;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    // Transform MongoDB _id to id
    const transformedData = transformMongoId(response.data);

    return transformedData;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (import.meta.env.DEV) {
      console.error('[API Response Error]', error);
    }

    if (!error.response) {
      toast({
        title: 'خطأ في الاتصال',
        description: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        variant: 'destructive',
      });
      return Promise.reject(handleApiError(error));
    }

    const { status } = error.response;

    if (status === 401 && !originalRequest._retry && !isRetrying) {
      originalRequest._retry = true;
      isRetrying = true;

      try {
        const newToken = await refreshAccessToken();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        isRetrying = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRetrying = false;
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(handleApiError(refreshError));
      }
    }

    if (status === 403) {
      toast({
        title: 'غير مصرح',
        description: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
        variant: 'destructive',
      });
    } else if (status === 404) {
      toast({
        title: 'غير موجود',
        description: 'المحتوى المطلوب غير موجود.',
        variant: 'destructive',
      });
    } else if (status >= 500) {
      toast({
        title: 'خطأ في الخادم',
        description: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
        variant: 'destructive',
      });
    }

    return Promise.reject(handleApiError(error));
  }
);

export default apiClient;
