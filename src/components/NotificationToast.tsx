/**
 * Notification Toast Component
 * Displays incoming notifications as toast messages
 */

import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AppNotification, NotificationType } from "@/types/notifications";
import { Bell, Music, Trophy, Clock, Diamond, Info } from "lucide-react";
import { getNotificationPermission } from "@/lib/notifications/permissions";

/**
 * Get icon component based on notification type
 */
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'new_content':
      return Music;
    case 'achievement':
      return Trophy;
    case 'reminder':
      return Clock;
    case 'subscription':
      return Diamond;
    case 'system':
      return Info;
    default:
      return Bell;
  }
};

/**
 * Play notification sound
 */
const playNotificationSound = () => {
  try {
    // Create a simple notification beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set a pleasant notification tone (E5 note)
    oscillator.frequency.value = 659.25;
    oscillator.type = 'sine';

    // Set volume (0.0 to 1.0)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

/**
 * Show a notification toast
 */
export const showNotificationToast = (
  notification: AppNotification,
  onNavigate?: (notification: AppNotification) => void,
  playSound: boolean = true
) => {
  const Icon = getNotificationIcon(notification.type);

  // Play notification sound
  if (playSound) {
    playNotificationSound();
  }

  // Send browser notification if permission is granted
  if (getNotificationPermission() === 'granted') {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: false,
        silent: !playSound,
        data: notification.data,
      });

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        if (onNavigate) {
          onNavigate(notification);
        }
      };

      // Auto-close after 5 seconds
      setTimeout(() => browserNotification.close(), 5000);
    } catch (error) {
      console.error('Failed to send browser notification:', error);
    }
  }

  // Show in-app toast
  toast(notification.title, {
    description: notification.message,
    icon: <Icon className="w-5 h-5 text-primary" />,
    duration: 5000,
    position: "top-center",
    className: "rtl",
    action: onNavigate
      ? {
          label: "عرض",
          onClick: () => onNavigate(notification),
        }
      : undefined,
  });
};

/**
 * Notification Toast Manager Component
 * Listens for new notifications and displays them as toasts
 */
interface NotificationToastManagerProps {
  notifications?: AppNotification[];
  onNotificationClick?: (notification: AppNotification) => void;
}

export const NotificationToastManager = ({
  notifications = [],
  onNotificationClick,
}: NotificationToastManagerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show toast for the most recent unread notification
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      if (!latestNotification.isRead) {
        const handleNavigate = (notification: AppNotification) => {
          if (onNotificationClick) {
            onNotificationClick(notification);
          } else {
            // Default navigation logic
            if (notification.data?.trackId) {
              navigate(`/player/${notification.data.trackId}`);
            } else if (notification.data?.programId) {
              navigate(`/program/${notification.data.programId}`);
            } else if (notification.data?.url) {
              navigate(notification.data.url);
            } else if (notification.type === 'subscription') {
              navigate('/subscription');
            } else {
              navigate('/notifications');
            }
          }
        };

        showNotificationToast(latestNotification, handleNavigate);
      }
    }
  }, [notifications, navigate, onNotificationClick]);

  return null;
};

export default NotificationToastManager;
