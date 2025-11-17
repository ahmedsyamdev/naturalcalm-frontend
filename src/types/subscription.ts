/**
 * Subscription and Payment Types
 * Types for subscription management and payment processing
 */

import { Subscription } from './index';

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  subscription: Subscription;
  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
}

export interface CouponValidation {
  valid: boolean;
  discount: number; // Percentage or fixed amount
  discountType: 'percentage' | 'fixed';
  finalAmount: number;
  message?: string;
  couponCode?: string;
}

export interface PaymentConfirmation {
  success: boolean;
  subscription?: Subscription;
  message: string;
  transactionId?: string;
}

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'visa' | 'apple-pay';
  date: string;
  packageName: string;
  transactionId: string;
}

export interface CreatePaymentIntentRequest {
  packageId: string;
  couponCode?: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface SubscribeRequest {
  packageId: string;
  paymentMethodId: string;
  couponCode?: string;
}
