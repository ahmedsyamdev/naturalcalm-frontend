import { useCallback, useEffect, useState } from 'react';
import { AuthService } from '@/lib/api/services/AuthService';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          renderButton: (element: HTMLElement, config: ButtonConfig) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
}

interface ButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeGoogle = useCallback((onSuccess: (user: unknown) => void, onError: (error: string) => void) => {
    if (!window.google || !GOOGLE_CLIENT_ID) {
      console.error('Google Identity Services not loaded or Client ID missing');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: GoogleCredentialResponse) => {
        setIsLoading(true);
        try {
          const result = await AuthService.socialLogin('google', response.credential);
          onSuccess(result);
        } catch (error) {
          console.error('Google login error:', error);
          onError('فشل تسجيل الدخول عبر جوجل');
        } finally {
          setIsLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    setIsInitialized(true);
  }, []);

  const promptGoogleLogin = useCallback(() => {
    if (!window.google || !isInitialized) {
      console.error('Google not initialized');
      return;
    }
    window.google.accounts.id.prompt();
  }, [isInitialized]);

  const renderGoogleButton = useCallback((elementId: string, config?: Partial<ButtonConfig>) => {
    if (!window.google || !isInitialized) {
      console.error('Google not initialized');
      return;
    }
    const element = document.getElementById(elementId);
    if (element) {
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'circle',
        ...config,
      });
    }
  }, [isInitialized]);

  return {
    isLoading,
    isInitialized,
    initializeGoogle,
    promptGoogleLogin,
    renderGoogleButton,
    clientId: GOOGLE_CLIENT_ID,
  };
};

export default useGoogleAuth;
