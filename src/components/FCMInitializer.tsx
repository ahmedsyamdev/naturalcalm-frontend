/**
 * FCM Initializer Component
 * Initializes Firebase Cloud Messaging when the app starts
 */

import { useEffect } from 'react';
import { useFCM } from '@/hooks/useFCM';

export const FCMInitializer = () => {
  const { isSupported, isLoading, error } = useFCM();

  useEffect(() => {
    if (!isLoading) {
      if (!isSupported) {
        console.log('FCM not supported or not configured');
      } else if (error) {
        console.error('FCM initialization error:', error);
      } else {
        console.log('FCM initialized successfully');
      }
    }
  }, [isLoading, isSupported, error]);

  // This component doesn't render anything
  return null;
};
