const CACHE_NAME = 'drojent-cache-v1';
const OFFLINE_URLS = ['/'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Пуш-уведомления
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'DroJent', body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'DroJent';
  const isCall = !!data.isCall;
  const options = {
    body: data.body || 'Новое сообщение',
    icon: data.icon || '/icon.jpg',
    badge: data.badge || '/icon.jpg',
    data: { url: data.url || '/' },
    tag: data.tag,
    // Звонок вибрирует дольше и настойчивее и не гаснет сам, пока не нажмут
    vibrate: isCall ? [500, 200, 500, 200, 500, 200, 500] : [100, 50, 100],
    requireInteraction: isCall,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Клик по уведомлению — открыть/сфокусировать вкладку сайта
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
