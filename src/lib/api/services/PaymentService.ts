/**
 * Payment Service
 * Handles API calls for payment processing
 */

import { BaseService } from '../BaseService';
import { PaymentMethod } from '@/types';
import {
  PaymentIntent,
  CouponValidation,
  PaymentConfirmation,
  Payment,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
} from '@/types/subscription';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class PaymentServiceClass extends BaseService {
  async validateCoupon(code: string, packageId: string): Promise<CouponValidation> {
    const response = await this.post<any>('/payments/validate-coupon', {
      code,
      packageId,
    });

    // API returns { success, valid, data: { ... } }
    // We need to merge valid with data fields
    return {
      valid: response.valid,
      discount: response.data.discount,
      discountType: response.data.discountType,
      finalAmount: response.data.finalAmount,
      message: response.message,
      couponCode: response.data.code,
    };
  }

  async createPaymentIntent(packageId: string, couponCode?: string): Promise<PaymentIntent> {
    const data: CreatePaymentIntentRequest = {
      packageId,
      couponCode,
    };
    const response = await this.post<ApiResponse<PaymentIntent>>('/payments/create-intent', data);
    return response.data;
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<PaymentConfirmation> {
    const data: ConfirmPaymentRequest = {
      paymentIntentId,
      paymentMethodId,
    };
    const response = await this.post<PaymentConfirmation>('/payments/confirm', data);
    return response;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
    return response.data;
  }

  async getPaymentHistory(): Promise<Payment[]> {
    const response = await this.get<ApiResponse<Payment[]>>('/payments/history');
    return response.data;
  }
}

export const PaymentService = new PaymentServiceClass();
