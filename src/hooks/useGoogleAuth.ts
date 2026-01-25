import { useCallback, useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// Generate a random nonce for security
const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not configured');
      return;
    }

    setIsLoading(true);

    // Store nonce in sessionStorage for verification on callback
    const nonce = generateNonce();
    sessionStorage.setItem('google_auth_nonce', nonce);

    // Build OAuth URL for implicit flow with id_token
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: nonce,
      prompt: 'select_account',
    });

    // Redirect to Google OAuth
    window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }, []);

  return {
    isLoading,
    signInWithGoogle,
    clientId: GOOGLE_CLIENT_ID,
    isAvailable: !!GOOGLE_CLIENT_ID,
  };
};

export default useGoogleAuth;
