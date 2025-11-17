/**
 * React Query hooks for Subscriptions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionService } from '@/lib/api/services/SubscriptionService';
import { useNavigate } from 'react-router-dom';

export const usePackages = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: () => SubscriptionService.getPackages(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => SubscriptionService.getCurrentSubscription(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubscribe = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      packageId,
      paymentMethodId,
      couponCode,
    }: {
      packageId: string;
      paymentMethodId: string;
      couponCode?: string;
    }) => SubscriptionService.subscribe(packageId, paymentMethodId, couponCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate('/payment-success', { state: { subscription: data.subscription } });
    },
    onError: (error) => {
      console.error('Subscription failed:', error);
      navigate('/payment-failure', { state: { error } });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => SubscriptionService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRenewSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => SubscriptionService.renewSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
