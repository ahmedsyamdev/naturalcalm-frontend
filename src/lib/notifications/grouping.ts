/**
 * Notification Grouping Utilities
 * Groups notifications by type and time period
 */

import { Notification, NotificationType } from '@/types/notifications';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface NotificationGroup {
  id: string;
  type: NotificationType;
  title: string;
  count: number;
  notifications: Notification[];
  latestDate: Date;
  isExpanded?: boolean;
}

export interface TimeGroup {
  label: string;
  notifications: Notification[];
  groups?: NotificationGroup[];
}

/**
 * Get time period label for a notification
 */
export const getTimePeriodLabel = (date: Date): string => {
  if (isToday(date)) {
    return 'اليوم';
  } else if (isYesterday(date)) {
    return 'الأمس';
  } else if (isThisWeek(date)) {
    return 'هذا الأسبوع';
  } else {
    return 'أقدم';
  }
};

/**
 * Get group title based on notification type and count
 */
export const getGroupTitle = (type: NotificationType, count: number): string => {
  if (count === 1) {
    return '';
  }

  switch (type) {
    case 'new_content':
      return `${count} محتوى جديد`;
    case 'achievement':
      return `${count} إنجازات جديدة`;
    case 'reminder':
      return `${count} تذكيرات`;
    case 'subscription':
      return `${count} إشعارات الاشتراك`;
    case 'system':
      return `${count} إشعارات النظام`;
    default:
      return `${count} إشعارات`;
  }
};

/**
 * Check if notifications should be grouped together
 */
const shouldGroupNotifications = (notif1: Notification, notif2: Notification): boolean => {
  // Group notifications of the same type that arrived close together (within 1 hour)
  if (notif1.type !== notif2.type) {
    return false;
  }

  // Safety check for createdAt
  if (!notif1.createdAt || !notif2.createdAt) {
    return false;
  }

  try {
    const date1 = parseISO(notif1.createdAt);
    const date2 = parseISO(notif2.createdAt);
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const oneHour = 60 * 60 * 1000;

    return timeDiff < oneHour;
  } catch (error) {
    console.error('Error parsing notification dates:', error);
    return false;
  }
};

/**
 * Group notifications by type (within same time period)
 */
export const groupNotificationsByType = (notifications: Notification[]): NotificationGroup[] => {
  const groups: NotificationGroup[] = [];

  notifications.forEach((notification) => {
    // Safety check for createdAt
    if (!notification.createdAt) {
      console.warn('Notification missing createdAt:', notification);
      return;
    }

    let date: Date;
    try {
      date = parseISO(notification.createdAt);
    } catch (error) {
      console.error('Error parsing notification date:', notification.createdAt, error);
      return;
    }

    // Find existing group this notification can join
    const existingGroup = groups.find((group) => {
      // Check if this notification matches the group
      if (group.type !== notification.type) {
        return false;
      }

      // Check if the notification is close enough in time to the group
      return shouldGroupNotifications(
        { ...notification, createdAt: notification.createdAt },
        { ...group.notifications[0], createdAt: group.notifications[0].createdAt }
      );
    });

    if (existingGroup) {
      // Add to existing group
      existingGroup.notifications.push(notification);
      existingGroup.count = existingGroup.notifications.length;
      existingGroup.title = getGroupTitle(existingGroup.type, existingGroup.count);

      // Update latest date if this notification is newer
      if (date > existingGroup.latestDate) {
        existingGroup.latestDate = date;
      }
    } else {
      // Create new group with stable ID based on type and first notification ID
      groups.push({
        id: `group-${notification.type}-${notification.id}`,
        type: notification.type,
        title: getGroupTitle(notification.type, 1),
        count: 1,
        notifications: [notification],
        latestDate: date,
        isExpanded: false,
      });
    }
  });

  // Sort groups by latest date (newest first)
  return groups.sort((a, b) => b.latestDate.getTime() - a.latestDate.getTime());
};

/**
 * Group notifications by time period
 */
export const groupNotificationsByTime = (notifications: Notification[]): TimeGroup[] => {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const thisWeek: Notification[] = [];
  const older: Notification[] = [];

  notifications.forEach((notification) => {
    // Safety check for createdAt
    if (!notification.createdAt) {
      console.warn('Notification missing createdAt:', notification);
      older.push(notification); // Put in older by default
      return;
    }

    let date: Date;
    try {
      date = parseISO(notification.createdAt);
    } catch (error) {
      console.error('Error parsing notification date:', notification.createdAt, error);
      older.push(notification); // Put in older by default
      return;
    }

    if (isToday(date)) {
      today.push(notification);
    } else if (isYesterday(date)) {
      yesterday.push(notification);
    } else if (isThisWeek(date)) {
      thisWeek.push(notification);
    } else {
      older.push(notification);
    }
  });

  const timeGroups: TimeGroup[] = [];

  if (today.length > 0) {
    timeGroups.push({
      label: 'اليوم',
      notifications: today,
      groups: groupNotificationsByType(today),
    });
  }

  if (yesterday.length > 0) {
    timeGroups.push({
      label: 'الأمس',
      notifications: yesterday,
      groups: groupNotificationsByType(yesterday),
    });
  }

  if (thisWeek.length > 0) {
    timeGroups.push({
      label: 'هذا الأسبوع',
      notifications: thisWeek,
      groups: groupNotificationsByType(thisWeek),
    });
  }

  if (older.length > 0) {
    timeGroups.push({
      label: 'أقدم',
      notifications: older,
      groups: groupNotificationsByType(older),
    });
  }

  return timeGroups;
};

/**
 * Get summary message for a notification group
 */
export const getGroupSummary = (group: NotificationGroup): string => {
  if (group.count === 1) {
    return group.notifications[0].message;
  }

  // Create a summary based on the notification type
  switch (group.type) {
    case 'new_content':
      return `تم إضافة ${group.count} محتوى جديد إلى التطبيق`;
    case 'achievement':
      return `لديك ${group.count} إنجازات جديدة`;
    case 'reminder':
      return `لديك ${group.count} تذكيرات`;
    case 'subscription':
      return `${group.count} إشعارات تتعلق بالاشتراك`;
    case 'system':
      return `${group.count} إشعارات من النظام`;
    default:
      return `لديك ${group.count} إشعارات جديدة`;
  }
};
