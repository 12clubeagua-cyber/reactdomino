const CACHE_NAME = 'domino-felipe-v123'; // v123: Accessibility expansion and performance refinements

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/accessibilitymanager.js',
  '/accessibilitysuite.js',
  '/animations.js',
  '/audio.js',
  '/bots.js',
  '/config.js',
  '/dashboard.js',
  '/dealer.js',
  '/flowui.js',
  '/game.js',
  '/identity.js',
  '/input.js',
  '/lobby.js',
  '/logic.js',
  '/multiplayer.js',
  '/names.js',
  '/network.js',
  '/referee.js',
  '/renderer.js',
  '/seats.js',
  '/state.js',
  '/ui.js',
  '/utils.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
                return cachedResponse || fetchPromise;
            });
        })
    );
});