/**
 * React Query hooks for Admin Notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminNotificationService,
  NotificationTemplate,
  NotificationStats,
  NotificationHistoryResponse,
  SendNotificationRequest,
  BroadcastNotificationRequest,
  UserForNotification,
  TrackForNotification,
  ProgramForNotification,
} from '@/lib/api/services/AdminNotificationService';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch notification templates
 */
export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'templates'],
    queryFn: () => AdminNotificationService.getTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes - templates don't change often
  });
};

/**
 * Hook to fetch notification statistics
 */
export const useNotificationStats = () => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'stats'],
    queryFn: () => AdminNotificationService.getStats(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to send notification to a specific user
 */
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendNotificationRequest) => AdminNotificationService.sendToUser(data),
    onSuccess: () => {
      // Invalidate stats to reflect the new notification
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'stats'] });

      toast({
        title: 'نجح الإرسال',
        description: 'تم إرسال الإشعار بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل الإرسال',
        description: error.message || 'حدث خطأ أثناء إرسال الإشعار',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to broadcast notification to all users or specific groups
 */
export const useBroadcastNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BroadcastNotificationRequest) => AdminNotificationService.broadcast(data),
    onSuccess: (response) => {
      // Invalidate stats to reflect the new notifications
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'stats'] });

      toast({
        title: 'نجح البث',
        description: `تم إرسال ${response.count} إشعار إلى ${response.userCount} مستخدم`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل البث',
        description: error.message || 'حدث خطأ أثناء بث الإشعار',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to fetch users for notification dropdown
 */
export const useNotificationUsers = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'users', search],
    queryFn: () => AdminNotificationService.getUsers(search),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch tracks for linking to notifications
 */
export const useNotificationTracks = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'tracks', search],
    queryFn: () => AdminNotificationService.getTracks(search),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch programs for linking to notifications
 */
export const useNotificationPrograms = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'programs', search],
    queryFn: () => AdminNotificationService.getPrograms(search),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch notification history with pagination
 */
export const useNotificationHistory = (page = 1, limit = 50, type?: string) => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'history', page, limit, type],
    queryFn: () => AdminNotificationService.getHistory(page, limit, type),
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true, // Keep previous page data while loading next page
  });
};
