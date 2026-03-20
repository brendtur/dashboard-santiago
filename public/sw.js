self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    // Recibe configuración desde la app
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});