/**
 * React Query hooks for Payments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '@/lib/api/services/PaymentService';
import { useNavigate } from 'react-router-dom';

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: () => PaymentService.getPaymentMethods(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ['payment', 'history'],
    queryFn: () => PaymentService.getPaymentHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, packageId }: { code: string; packageId: string }) =>
      PaymentService.validateCoupon(code, packageId),
  });
};

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: ({ packageId, couponCode }: { packageId: string; couponCode?: string }) =>
      PaymentService.createPaymentIntent(packageId, couponCode),
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ paymentIntentId, paymentMethodId }: { paymentIntentId: string; paymentMethodId?: string }) =>
      PaymentService.confirmPayment(paymentIntentId, paymentMethodId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['payment', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      if (data.success) {
        navigate('/payment-success', { state: { subscription: data.subscription } });
      } else {
        navigate('/payment-failure', { state: { error: data.message } });
      }
    },
    onError: (error) => {
      console.error('Payment confirmation failed:', error);
      navigate('/payment-failure', { state: { error } });
    },
  });
};
