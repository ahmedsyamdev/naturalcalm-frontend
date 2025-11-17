/**
 * Notifications Page
 * Display user notifications with real-time updates and actions
 */

import { ArrowRight, Bell, Heart, Clock, Trash2, Loader2, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useInfiniteNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useUnreadCount,
} from "@/hooks/queries/useNotifications";
import { Notification, NotificationType } from "@/types/notifications";
import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { groupNotificationsByTime, getGroupSummary, type NotificationGroup, type TimeGroup } from "@/lib/notifications/grouping";

const Notifications = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [isGroupingEnabled, setIsGroupingEnabled] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Queries and mutations
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications(20);

  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Flatten all pages of notifications
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  // Group notifications by time
  const timeGroups = useMemo(() => {
    if (!isGroupingEnabled || notifications.length === 0) {
      return null;
    }
    return groupNotificationsByTime(notifications);
  }, [notifications, isGroupingEnabled]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType, icon?: string) => {
    if (icon) return icon;

    switch (type) {
      case 'new_content':
        return '🎵';
      case 'achievement':
        return '🎉';
      case 'reminder':
        return '⏰';
      case 'subscription':
        return '💎';
      case 'system':
        return '🔔';
      default:
        return '📌';
    }
  };

  // Get notification background color based on type
  const getNotificationColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return "bg-white";

    switch (type) {
      case 'achievement':
        return "bg-green-50 border-green-200";
      case 'reminder':
        return "bg-blue-50 border-blue-200";
      case 'subscription':
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // Format timestamp in Arabic
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: arSA,
      });
    } catch {
      return timestamp;
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    // Navigate based on notification data
    if (notification.data?.trackId) {
      navigate(`/player/${notification.data.trackId}`);
    } else if (notification.data?.programId) {
      navigate(`/program/${notification.data.programId}`);
    } else if (notification.data?.url) {
      navigate(notification.data.url);
    } else if (notification.type === 'subscription') {
      navigate('/subscription');
    }
  };

  // Handle delete notification
  const handleDeleteClick = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (notificationToDelete) {
      await deleteNotificationMutation.mutateAsync(notificationToDelete);
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex gap-4">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <button className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5 text-primary" />
                </button>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{unreadCount}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate("/favorites")}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <Heart className="w-4.5 h-4.5 text-primary" />
              </button>
            </div>

            <h1 className="text-xl font-bold flex-1 text-center">الإشعارات</h1>

            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Action buttons */}
        {!isLoading && notifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between gap-4">
            {/* Group Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={isGroupingEnabled}
                onCheckedChange={setIsGroupingEnabled}
                dir="ltr"
              />
              <label className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span>تجميع الإشعارات</span>
              </label>
            </div>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="ghost"
                className="text-primary text-sm font-medium"
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تعليم الكل كمقروء'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">حدث خطأ</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'تعذر تحميل الإشعارات'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && !isError && (
          <>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {/* Grouped View */}
                {isGroupingEnabled && timeGroups ? (
                  timeGroups.map((timeGroup) => (
                    <div key={timeGroup.label} className="space-y-3">
                      {/* Time Period Label */}
                      <h3 className="text-sm font-bold text-muted-foreground px-2">
                        {timeGroup.label}
                      </h3>

                      {/* Notification Groups */}
                      {timeGroup.groups?.map((group) => {
                        const isExpanded = expandedGroups.has(group.id);
                        const hasMultiple = group.count > 1;
                        const hasUnread = group.notifications.some((n) => !n.isRead);

                        return (
                          <div key={group.id} className="space-y-2">
                            {/* Group Header (only show if multiple notifications) */}
                            {hasMultiple && (
                              <div
                                onClick={() => toggleGroup(group.id)}
                                className="bg-white rounded-2xl p-3 shadow-sm border-2 border-gray-100 cursor-pointer hover:shadow-md transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                      <span className="text-lg">
                                        {getNotificationIcon(group.type)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">{group.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {getGroupSummary(group)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {hasUnread && (
                                      <div className="w-2 h-2 bg-primary rounded-full" />
                                    )}
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Group Notifications (show if expanded or single notification) */}
                            {(isExpanded || !hasMultiple) && (
                              <div className={`space-y-2 ${hasMultiple ? 'pl-4' : ''}`}>
                                {group.notifications.map((notification) => (
                                  <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`
                                      bg-white rounded-2xl p-4 shadow-sm border-2 transition-all cursor-pointer
                                      ${notification.isRead ? "border-transparent" : "border-primary/20"}
                                      ${getNotificationColor(notification.type, notification.isRead)}
                                      hover:shadow-md relative group
                                    `}
                                  >
                                    <div className="flex gap-4">
                                      {/* Icon */}
                                      <div className="shrink-0">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                          <span className="text-2xl">
                                            {getNotificationIcon(notification.type, notification.icon)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                          <h3
                                            className={`text-base font-bold ${
                                              !notification.isRead ? "text-primary" : "text-foreground"
                                            }`}
                                          >
                                            {notification.title}
                                          </h3>
                                          {!notification.isRead && (
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-1.5" />
                                          )}
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                                          {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{formatTimestamp(notification.createdAt)}</span>
                                          </div>

                                          {/* Delete Button */}
                                          <button
                                            onClick={(e) => handleDeleteClick(notification.id, e)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                                            disabled={deleteNotificationMutation.isPending}
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  /* Ungrouped View */
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        bg-white rounded-2xl p-4 shadow-sm border-2 transition-all cursor-pointer
                        ${notification.isRead ? "border-transparent" : "border-primary/20"}
                        ${getNotificationColor(notification.type, notification.isRead)}
                        hover:shadow-md relative group
                      `}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="shrink-0">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-2xl">
                              {getNotificationIcon(notification.type, notification.icon)}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3
                              className={`text-base font-bold ${
                                !notification.isRead ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatTimestamp(notification.createdAt)}</span>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDeleteClick(notification.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                              disabled={deleteNotificationMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="outline"
                      className="w-full"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري التحميل...
                        </>
                      ) : (
                        'تحميل المزيد'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">لا توجد إشعارات</h3>
                <p className="text-sm text-muted-foreground">
                  سنرسل لك إشعاراً عند وجود تحديثات جديدة
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإشعار</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الإشعار؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notifications;
