/**
 * Notification Permission Request Dialog
 * Prompts user to enable browser notifications
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  hasRequestedPermission,
  getPermissionMessage,
  getReEnableInstructions,
  sendTestNotification,
  type NotificationPermissionState,
} from '@/lib/notifications/permissions';
import { requestFCMToken } from '@/lib/firebase/fcm';

interface NotificationPermissionDialogProps {
  /** Control dialog visibility externally */
  open?: boolean;
  /** Callback when dialog closes */
  onOpenChange?: (open: boolean) => void;
  /** Show dialog automatically on first visit */
  autoShow?: boolean;
  /** Delay before showing (ms) */
  showDelay?: number;
}

export const NotificationPermissionDialog = ({
  open: controlledOpen,
  onOpenChange,
  autoShow = true,
  showDelay = 5000,
}: NotificationPermissionDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = (open: boolean) => {
    if (isControlled) {
      onOpenChange?.(open);
    } else {
      setInternalOpen(open);
    }
  };

  useEffect(() => {
    // Check initial permission state
    const currentPermission = getNotificationPermission();
    setPermissionState(currentPermission);

    // Auto-show dialog if:
    // 1. autoShow is enabled
    // 2. Browser supports notifications
    // 3. Permission hasn't been requested before
    // 4. Current permission is 'default'
    if (
      autoShow &&
      isNotificationSupported() &&
      !hasRequestedPermission() &&
      currentPermission === 'default'
    ) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, showDelay]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setShowInstructions(false);

    const result = await requestNotificationPermission();
    setPermissionState(result);

    if (result === 'granted') {
      // Request FCM token (this will also send it to backend)
      try {
        await requestFCMToken();
        console.log('FCM token requested and registered');
      } catch (error) {
        console.error('Failed to get FCM token:', error);
      }

      // Send a test notification
      sendTestNotification(
        'تم تفعيل الإشعارات!',
        'سنرسل لك إشعارات حول محتوى جديد وتذكيرات يومية'
      );

      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } else if (result === 'denied') {
      setShowInstructions(true);
    }

    setIsRequesting(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  // Don't show if browser doesn't support notifications
  if (!isNotificationSupported()) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">
            {permissionState === 'granted'
              ? 'تم تفعيل الإشعارات!'
              : permissionState === 'denied'
              ? 'تم رفض الإذن'
              : 'فعّل الإشعارات'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {permissionState === 'granted'
              ? 'سنرسل لك إشعارات حول محتوى جديد وتذكيرات يومية'
              : permissionState === 'denied'
              ? 'يمكنك تفعيل الإشعارات من إعدادات المتصفح'
              : 'احصل على إشعارات حول محتوى جديد، تذكيرات يومية، وتحديثات مهمة'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Permission State Alert */}
          {permissionState !== 'default' && (
            <Alert
              className={
                permissionState === 'granted'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }
            >
              <div className="flex items-start gap-3">
                {permissionState === 'granted' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <AlertDescription
                  className={
                    permissionState === 'granted' ? 'text-green-800' : 'text-red-800'
                  }
                >
                  {getPermissionMessage(permissionState)}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Features List (only show for default state) */}
          {permissionState === 'default' && (
            <div className="space-y-3 py-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🎵</span>
                </div>
                <div>
                  <p className="font-medium text-sm">محتوى جديد</p>
                  <p className="text-xs text-muted-foreground">
                    اعرف متى نضيف مسارات وبرامج جديدة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⏰</span>
                </div>
                <div>
                  <p className="font-medium text-sm">تذكيرات يومية</p>
                  <p className="text-xs text-muted-foreground">
                    احصل على تذكير للتأمل اليومي
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <p className="font-medium text-sm">إنجازاتك</p>
                  <p className="text-xs text-muted-foreground">
                    احتفل بإنجازاتك وتقدمك
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Re-enable Instructions */}
          {showInstructions && permissionState === 'denied' && (
            <Alert className="bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-blue-800 text-xs whitespace-pre-line">
                  {getReEnableInstructions()}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-row-reverse gap-2">
          {permissionState === 'default' && (
            <>
              <Button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="flex-1"
              >
                {isRequesting ? 'جاري التفعيل...' : 'تفعيل الإشعارات'}
              </Button>
              <Button variant="outline" onClick={handleDismiss} className="flex-1">
                ربما لاحقاً
              </Button>
            </>
          )}

          {permissionState === 'granted' && (
            <Button onClick={handleDismiss} className="w-full">
              تم
            </Button>
          )}

          {permissionState === 'denied' && (
            <>
              {!showInstructions && (
                <Button
                  variant="outline"
                  onClick={() => setShowInstructions(true)}
                  className="flex-1"
                >
                  كيف أفعلها؟
                </Button>
              )}
              <Button onClick={handleDismiss} className="flex-1">
                حسناً
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
