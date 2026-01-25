import { useCallback, useState } from 'react';
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
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
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

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: ErrorResponse) => void;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface ErrorResponse {
  type: string;
  message: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = useCallback(async (
    onSuccess: (user: unknown) => void,
    onError: (error: string) => void
  ) => {
    if (!window.google) {
      onError('Google Sign-In غير متاح');
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      onError('تسجيل الدخول عبر جوجل غير مُعد');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize and use credential response (One Tap + popup fallback)
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: GoogleCredentialResponse) => {
          try {
            const result = await AuthService.socialLogin('google', response.credential);
            onSuccess(result);
          } catch (error) {
            console.error('Google login API error:', error);
            onError('فشل تسجيل الدخول عبر جوجل');
          } finally {
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Try One Tap first, fallback to button click
      window.google.accounts.id.prompt((notification: PromptNotification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
          // One Tap not available, use FedCM or show manual button
          // Create a temporary button and click it
          const buttonDiv = document.createElement('div');
          buttonDiv.id = 'google-signin-temp-button';
          buttonDiv.style.position = 'fixed';
          buttonDiv.style.top = '50%';
          buttonDiv.style.left = '50%';
          buttonDiv.style.transform = 'translate(-50%, -50%)';
          buttonDiv.style.zIndex = '9999';
          buttonDiv.style.backgroundColor = 'white';
          buttonDiv.style.padding = '20px';
          buttonDiv.style.borderRadius = '12px';
          buttonDiv.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
          document.body.appendChild(buttonDiv);

          window.google!.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 280,
          });

          // Add close button
          const closeBtn = document.createElement('button');
          closeBtn.innerHTML = '✕';
          closeBtn.style.position = 'absolute';
          closeBtn.style.top = '5px';
          closeBtn.style.right = '10px';
          closeBtn.style.border = 'none';
          closeBtn.style.background = 'none';
          closeBtn.style.fontSize = '18px';
          closeBtn.style.cursor = 'pointer';
          closeBtn.onclick = () => {
            document.body.removeChild(buttonDiv);
            setIsLoading(false);
          };
          buttonDiv.appendChild(closeBtn);

          // Add overlay
          const overlay = document.createElement('div');
          overlay.id = 'google-signin-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
          overlay.style.zIndex = '9998';
          overlay.onclick = () => {
            document.body.removeChild(buttonDiv);
            document.body.removeChild(overlay);
            setIsLoading(false);
          };
          document.body.insertBefore(overlay, buttonDiv);

          // Clean up after successful login
          const originalCallback = window.google!.accounts.id.initialize;
          window.google!.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: GoogleCredentialResponse) => {
              // Remove popup elements
              const btn = document.getElementById('google-signin-temp-button');
              const ovl = document.getElementById('google-signin-overlay');
              if (btn) document.body.removeChild(btn);
              if (ovl) document.body.removeChild(ovl);

              try {
                const result = await AuthService.socialLogin('google', response.credential);
                onSuccess(result);
              } catch (error) {
                console.error('Google login API error:', error);
                onError('فشل تسجيل الدخول عبر جوجل');
              } finally {
                setIsLoading(false);
              }
            },
          });
        }
      });
    } catch (error) {
      console.error('Google Sign-In error:', error);
      onError('حدث خطأ في تسجيل الدخول عبر جوجل');
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    signInWithGoogle,
    clientId: GOOGLE_CLIENT_ID,
    isAvailable: !!GOOGLE_CLIENT_ID && !!window.google,
  };
};

export default useGoogleAuth;
