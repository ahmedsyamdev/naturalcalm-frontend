/**
 * Flutter WebView Bridge — Reverse bridge for FCM
 *
 * When the Naturacalm app runs inside a Flutter WebView, the native layer
 * handles FCM (Firebase Cloud Messaging) because the web Firebase JS SDK
 * is unreliable inside WebViews. Flutter gets the native FCM token and
 * hands it to the web via window.registerFlutterFCMToken(). The web then
 * registers it with the backend using the user's current JWT.
 */

import { NotificationsService } from '@/lib/api/services/NotificationsService';
import { getAuthToken } from '@/lib/api/tokens';

type Platform = 'mobile' | 'web';

interface PendingFCMRegistration {
  token: string;
  platform: Platform;
  browser?: string;
}

const PENDING_KEY = 'pending_flutter_fcm';

const savePending = (payload: PendingFCMRegistration) => {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to persist pending FCM token:', e);
  }
};

const loadPending = (): PendingFCMRegistration | null => {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingFCMRegistration) : null;
  } catch {
    return null;
  }
};

const clearPending = () => {
  localStorage.removeItem(PENDING_KEY);
};

const registerWithBackend = async (payload: PendingFCMRegistration): Promise<boolean> => {
  try {
    await NotificationsService.registerDevice(payload.token, payload.platform, payload.browser);
    console.log('[FlutterBridge] FCM token registered with backend');
    localStorage.setItem('fcm_token', payload.token);
    clearPending();
    return true;
  } catch (err) {
    console.error('[FlutterBridge] Failed to register FCM token:', err);
    return false;
  }
};

/**
 * Called by Flutter via evaluateJavascript.
 * If the user is logged in, register immediately. Otherwise, cache and
 * register on the next successful login.
 */
const registerFlutterFCMToken = async (
  token: string,
  platform: Platform = 'mobile',
  browser?: string
): Promise<{ registered: boolean; queued: boolean }> => {
  if (!token) return { registered: false, queued: false };

  const payload: PendingFCMRegistration = { token, platform, browser };

  if (!getAuthToken()) {
    savePending(payload);
    console.log('[FlutterBridge] No JWT yet — token queued until login');
    return { registered: false, queued: true };
  }

  const ok = await registerWithBackend(payload);
  if (!ok) savePending(payload);
  return { registered: ok, queued: !ok };
};

/**
 * Attempt to flush any pending Flutter FCM token. Call this after login.
 */
export const flushPendingFlutterFCM = async (): Promise<boolean> => {
  const pending = loadPending();
  if (!pending) return false;
  if (!getAuthToken()) return false;
  return registerWithBackend(pending);
};

/**
 * Install the global bridge on window. Call once at app startup.
 */
export const installFlutterFCMBridge = () => {
  if (typeof window === 'undefined') return;
  (window as unknown as { registerFlutterFCMToken: typeof registerFlutterFCMToken }).registerFlutterFCMToken = registerFlutterFCMToken;
  console.log('[FlutterBridge] window.registerFlutterFCMToken is ready');
};
