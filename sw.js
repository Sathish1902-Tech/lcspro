const CACHE_NAME = 'cricket-scorer-pro-v3';

// On install, pre-cache core assets and prepare to activate.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html'
      ]);
    }).then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker.
  );
});

// On activate, remove old caches and take control of clients.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// On fetch, use a network-first, falling back to cache strategy.
self.addEventListener('fetch', event => {
  // We only want to handle GET requests and http/https schemes.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
      return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If the fetch is successful, clone it, cache it, and return it.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(() => {
        // If the network request fails (e.g., offline), try to serve from the cache.
        return caches.match(event.request);
      })
  );
});
