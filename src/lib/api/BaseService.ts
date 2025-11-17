/**
 * Base API Service Class
 * Provides a foundation for creating service classes with common HTTP methods
 */

import { AxiosRequestConfig } from 'axios';
import apiClient from './client';

export class BaseService {
  protected apiClient = apiClient;

  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.apiClient.get<T, T>(url, config);
  }

  protected async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.apiClient.post<T, T>(url, data, config);
  }

  protected async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.apiClient.put<T, T>(url, data, config);
  }

  protected async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.apiClient.patch<T, T>(url, data, config);
  }

  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.apiClient.delete<T, T>(url, config);
  }
}
