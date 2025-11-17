/**
 * API Error Handling Utilities
 * Standardizes error handling across the application
 */

import { AxiosError } from 'axios';
import { ApiError } from './types';

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const response = error.response;

    if (response) {
      // Handle nested error objects from backend
      let message = 'حدث خطأ في الخادم';

      if (response.data?.message) {
        message = response.data.message;
      } else if (response.data?.error) {
        // If error is an object with a message property
        if (typeof response.data.error === 'object' && response.data.error.message) {
          message = response.data.error.message;
        } else if (typeof response.data.error === 'string') {
          message = response.data.error;
        }
      } else if (response.statusText) {
        message = response.statusText;
      }

      const errors = response.data?.errors || [];

      return {
        message,
        status: response.status,
        code: response.data?.code || response.data?.error?.statusCode?.toString(),
        errors,
      };
    }

    if (error.request) {
      return {
        message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'حدث خطأ غير متوقع',
      status: 500,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'حدث خطأ غير متوقع',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error &&
    typeof (error as ApiError).message === 'string' &&
    typeof (error as ApiError).status === 'number'
  );
}
