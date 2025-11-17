/**
 * Application Configuration
 * Handles environment variables and API settings
 *
 * Environment Variables:
 * - VITE_API_URL: Full API URL (e.g., http://localhost:5000/api/v1 or https://api.naturacalm.com/api/v1)
 * - VITE_ENV: Environment (development, staging, production)
 */

// API URL with /api/v1 suffix
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Server base URL (without /api/v1)
export const SERVER_BASE_URL = API_URL.replace(/\/api\/v1$/, '');

// Environment
export const ENV = import.meta.env.VITE_ENV || 'development';
export const IS_PRODUCTION = ENV === 'production';
export const IS_DEVELOPMENT = ENV === 'development';

export const config = {
  apiUrl: API_URL,
  apiBaseUrl: SERVER_BASE_URL,
  imageBaseUrl: SERVER_BASE_URL,
  env: ENV,
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT,
} as const;

/**
 * Get the full image URL
 * @param imagePath - The image path (can be full URL or relative path)
 * @returns Full image URL
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return '/placeholder.svg'; // Fallback image
  }

  // If it's already a full URL (starts with http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path starting with /uploads, prepend the image base URL
  if (imagePath.startsWith('/uploads')) {
    return `${config.imageBaseUrl}${imagePath}`;
  }

  // If it's just a filename or relative path, construct the full URL
  if (imagePath.startsWith('uploads/')) {
    return `${config.imageBaseUrl}/${imagePath}`;
  }

  // For other cases, assume it's a relative path and prepend base URL
  return `${config.imageBaseUrl}/${imagePath}`;
};

export default config;


