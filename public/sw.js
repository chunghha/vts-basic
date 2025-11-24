// Service Worker DISABLED - Unregister and Clear Cache
// This service worker immediately unregisters itself and clears all caches

console.log('[Service Worker] Unregister script loaded - cleaning up...');

// On install, skip waiting and activate immediately
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing unregister script...');
  event.waitUntil(self.skipWaiting());
});

// On activate, delete ALL caches and unregister
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating unregister script - deleting all caches...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[Service Worker] Found caches:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[Service Worker] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] All caches deleted');
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients to unregister
        return self.clients.matchAll();
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'UNREGISTER_SW',
            message: 'Service Worker is being unregistered',
          });
        });
      })
  );
});

// No fetch interception - pass through everything
self.addEventListener('fetch', (event) => {
  // Just fetch normally, no caching
  event.respondWith(fetch(event.request));
});

console.log('[Service Worker] Unregister script ready - all caching disabled');
