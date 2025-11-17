/**
 * React Query hooks for Notifications
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { NotificationsService } from '@/lib/api/services/NotificationsService';
import { Notification, NotificationPreferences } from '@/types/notifications';
import { PaginatedResponse } from '@/lib/api/types';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to fetch paginated notifications
 */
export const useNotifications = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => NotificationsService.getNotifications(page, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch notifications with infinite scroll
 */
export const useInfiniteNotifications = (limit: number = 20) => {
  return useInfiniteQuery<PaginatedResponse<Notification>>({
    queryKey: ['notifications', 'infinite'],
    queryFn: ({ pageParam = 1 }) => NotificationsService.getNotifications(pageParam as number, limit),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch unread notifications count
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => NotificationsService.getUnreadCount(),
    staleTime: 10 * 1000, // 10 seconds - short refetch interval for real-time feel
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

/**
 * Hook to mark a notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationsService.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot the previous value
      const previousInfinite = queryClient.getQueryData(['notifications', 'infinite']);

      // Optimistically update infinite query
      queryClient.setQueryData<any>(['notifications', 'infinite'], (old: any) => {
        if (!old || !old.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: PaginatedResponse<Notification>) => ({
            ...page,
            data: page.data.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
          })),
        };
      });

      // Update unread count optimistically
      queryClient.setQueryData<number>(['notifications', 'unread-count'], (old = 0) => Math.max(0, old - 1));

      return { previousInfinite };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousInfinite) {
        queryClient.setQueryData(['notifications', 'infinite'], context.previousInfinite);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationsService.markAllAsRead(),
    onSuccess: () => {
      toast({
        title: 'تم تعليم الكل كمقروء',
        description: 'تم تعليم جميع الإشعارات كمقروءة بنجاح',
      });
      // Invalidate all notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تعليم الإشعارات كمقروءة',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationsService.deleteNotification(notificationId),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot the previous value
      const previousInfinite = queryClient.getQueryData(['notifications', 'infinite']);

      // Find if the deleted notification is unread
      let wasUnread = false;

      // Optimistically update infinite query
      queryClient.setQueryData<any>(['notifications', 'infinite'], (old: any) => {
        if (!old || !old.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: PaginatedResponse<Notification>) => {
            const deletedNotification = page.data.find(n => n.id === notificationId);
            if (deletedNotification && !deletedNotification.isRead) {
              wasUnread = true;
            }

            return {
              ...page,
              data: page.data.filter((notification) => notification.id !== notificationId),
              total: page.total - 1,
            };
          }),
        };
      });

      // Update unread count if deleted notification was unread
      if (wasUnread) {
        queryClient.setQueryData<number>(
          ['notifications', 'unread-count'],
          (count = 0) => Math.max(0, count - 1)
        );
      }

      return { previousInfinite };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousInfinite) {
        queryClient.setQueryData(['notifications', 'infinite'], context.previousInfinite);
      }
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف الإشعار',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الإشعار بنجاح',
      });
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

/**
 * Hook to fetch notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => NotificationsService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      NotificationsService.updatePreferences(preferences),
    onSuccess: (data, variables) => {
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات الإشعارات بنجاح',
      });

      // Update the cache with the saved preferences
      // This ensures the UI stays in sync even if GET endpoint fails
      queryClient.setQueryData(['notifications', 'preferences'], variables);

      // Also invalidate to refetch from server if available
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    },
  });
};
