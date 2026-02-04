/**
 * Token Management Utilities
 * Handles authentication token storage and retrieval
 * Always uses localStorage for mobile WebView compatibility
 */

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const REMEMBER_ME_KEY = 'rememberMe';

/**
 * Gets storage - always uses localStorage for WebView compatibility
 * WebViews clear sessionStorage when the app is closed, so we must use localStorage
 */
function getStorage(): Storage {
  return localStorage;
}

/**
 * Sets the Remember Me preference
 */
export function setRememberMe(remember: boolean): void {
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

/**
 * Gets the Remember Me preference
 */
export function getRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

/**
 * Sets the authentication token
 */
export function setAuthToken(token: string): void {
  const storage = getStorage();
  storage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Gets the authentication token from either storage
 */
export function getAuthToken(): string | null {
  // Check both storages (for backwards compatibility and migration)
  return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Sets the refresh token
 */
export function setRefreshToken(token: string): void {
  const storage = getStorage();
  storage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Gets the refresh token from either storage
 */
export function getRefreshToken(): string | null {
  // Check both storages (for backwards compatibility and migration)
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clears all authentication tokens from both storages
 */
export function clearTokens(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token !== null && token.length > 0;
}
