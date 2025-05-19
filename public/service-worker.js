const CACHE_NAME = 'zeromail-cache-v1';
const ASSETS_TO_CACHE = [
  '/src/assets/bg.png',
  '/src/assets/email-envelope-close--Streamline-Pixel.svg'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Serve cached assets when offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/src/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              // Cache the new request
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
        })
    );
  }
}); 