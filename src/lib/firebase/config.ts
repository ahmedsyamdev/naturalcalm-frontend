/**
 * Firebase Configuration
 *
 * IMPORTANT: To enable Firebase Cloud Messaging:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Go to Project Settings > Cloud Messaging
 * 3. Enable Cloud Messaging API (legacy) or Firebase Cloud Messaging API (V1)
 * 4. Copy your configuration values
 * 5. Create a .env file in the frontend directory with these values:
 *
 * VITE_FIREBASE_API_KEY=your-api-key
 * VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
 * VITE_FIREBASE_PROJECT_ID=your-project-id
 * VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
 * VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
 * VITE_FIREBASE_APP_ID=your-app-id
 * VITE_FIREBASE_VAPID_KEY=your-vapid-key (from Cloud Messaging > Web Push certificates)
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// VAPID key for web push notifications
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey
  );
};

/**
 * Initialize Firebase app
 */
export const initializeFirebase = async (): Promise<FirebaseApp | null> => {
  if (!isFirebaseConfigured()) {
    console.warn(
      'Firebase is not configured. Please add Firebase credentials to your .env file. ' +
      'See src/lib/firebase/config.ts for instructions.'
    );
    return null;
  }

  try {
    // Check if messaging is supported in this browser
    const messagingSupported = await isSupported();
    if (!messagingSupported) {
      console.warn('Firebase Messaging is not supported in this browser');
      return null;
    }

    // Initialize Firebase app if not already initialized
    if (!app) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    }

    return app;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

/**
 * Get Firebase Messaging instance
 */
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (messaging) {
    return messaging;
  }

  const firebaseApp = await initializeFirebase();
  if (!firebaseApp) {
    return null;
  }

  try {
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (error) {
    console.error('Error getting Firebase Messaging:', error);
    return null;
  }
};

export { app, messaging };
