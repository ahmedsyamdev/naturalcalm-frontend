/**
 * Subscription Service
 * Handles API calls for subscription management
 */

import { BaseService } from '../BaseService';
import { Package, Subscription } from '@/types';
import { SubscriptionResponse, SubscribeRequest } from '@/types/subscription';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class SubscriptionServiceClass extends BaseService {
  async getPackages(): Promise<Package[]> {
    const response = await this.get<ApiResponse<Package[]>>('/subscriptions/packages');
    return response.data;
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await this.get<ApiResponse<Subscription>>('/users/subscription');
      return response.data;
    } catch (error) {
      // Return null if user has no subscription
      return null;
    }
  }

  async subscribe(packageId: string, paymentMethodId: string, couponCode?: string): Promise<SubscriptionResponse> {
    const data: SubscribeRequest = {
      packageId,
      paymentMethodId,
      couponCode,
    };
    const response = await this.post<SubscriptionResponse>('/subscriptions/subscribe', data);
    return response;
  }

  async cancelSubscription(): Promise<void> {
    await this.post<ApiResponse<void>>('/subscriptions/cancel');
  }

  async renewSubscription(): Promise<void> {
    await this.post<ApiResponse<void>>('/subscriptions/renew');
  }
}

export const SubscriptionService = new SubscriptionServiceClass();
