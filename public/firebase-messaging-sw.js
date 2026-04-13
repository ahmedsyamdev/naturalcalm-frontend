/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 *
 * IMPORTANT: This file must be in the public directory and accessible at /firebase-messaging-sw.js
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId'),
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || '',
    icon: payload.notification?.icon || payload.data?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.notificationId || 'naturacalm-notification',
    data: payload.data,
    requireInteraction: false,
    silent: false,
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Get notification data
  const data = event.notification.data || {};

  // Determine which URL to open
  let urlToOpen = '/';

  if (data.trackId) {
    urlToOpen = `/player/${data.trackId}`;
  } else if (data.programId) {
    urlToOpen = `/program/${data.programId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  } else if (data.action === 'subscription') {
    urlToOpen = '/subscription';
  } else {
    urlToOpen = '/notifications';
  }

  // Open the app or focus existing window
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus the existing window and navigate
            return client.focus().then((client) => {
              return client.navigate(urlToOpen);
            });
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin + urlToOpen);
        }
      })
  );
});
