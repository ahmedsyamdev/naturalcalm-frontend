/**
 * Firebase Cloud Messaging React Hook
 * Initializes FCM and manages push notification state
 */

import { useEffect, useState } from 'react';
import { initializeFCM, requestFCMToken, getStoredFCMToken } from '@/lib/firebase/fcm';
import { isFirebaseConfigured } from '@/lib/firebase/config';

interface UseFCMReturn {
  isSupported: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  requestToken: () => Promise<string | null>;
}

/**
 * Hook to manage FCM initialization and token
 */
export const useFCM = (): UseFCMReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if Firebase is configured
        const configured = isFirebaseConfigured();
        setIsSupported(configured);

        if (!configured) {
          setError('Firebase not configured');
          setIsLoading(false);
          return;
        }

        // Initialize FCM
        await initializeFCM();

        // Check if we already have a token
        const storedToken = getStoredFCMToken();
        if (storedToken) {
          setToken(storedToken);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing FCM:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize FCM');
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const requestToken = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const fcmToken = await requestFCMToken();
      setToken(fcmToken);
      setIsLoading(false);

      return fcmToken;
    } catch (err) {
      console.error('Error requesting FCM token:', err);
      setError(err instanceof Error ? err.message : 'Failed to get FCM token');
      setIsLoading(false);
      return null;
    }
  };

  return {
    isSupported,
    token,
    isLoading,
    error,
    requestToken,
  };
};
