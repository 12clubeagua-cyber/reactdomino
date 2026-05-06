const CACHE_NAME = 'domino-felipe-v89'; // Incrementado para v89: Sincronizacao individual de game_start e maos privadas (Blind Hands)

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/accessibilitymanager.js',
  '/accessibilitysuite.js',
  '/achievements.js',
  '/analytics.js',
  '/animations.js',
  '/audio.js',
  '/bots.js',
  '/campaignengine.js',
  '/challengemanager.js',
  '/cinematicengine.js',
  '/cloudreplaymanager.js',
  '/cloudsyncmanager.js',
  '/config.js',
  '/coopmanager.js',
  '/crosssyncrewardmanager.js',
  '/dailyboardengine.js',
  '/dashboard.js',
  '/dealer.js',
  '/eliteachievementmanager.js',
  '/eventscheduler.js',
  '/exportmanager.js',
  '/flowui.js',
  '/game.js',
  '/ghostengine.js',
  '/hintmanager.js',
  '/historymanager.js',
  '/i18nmanager.js',
  '/identity.js',
  '/input.js',
  '/lobby.js',
  '/logic.js',
  '/multiplayer.js',
  '/mutatorengine.js',
  '/names.js',
  '/network.js',
  '/newsmanager.js',
  '/notificationmanager.js',
  '/powersaver.js',
  '/powerupengine.js',
  '/powerupspawner.js',
  '/prestigemanager.js',
  '/progressionmanager.js',
  '/puzzleengine.js',
  '/rankmanager.js',
  '/referee.js',
  '/rematchmanager.js',
  '/renderer.js',
  '/replaymanager.js',
  '/resourcemanager.js',
  '/rewardchestmanager.js',
  '/rewardengine.js',
  '/scenarioeditor.js',
  '/seats.js',
  '/snapshotmanager.js',
  '/socialfeedmanager.js',
  '/socialmanager.js',
  '/spectatormanager.js',
  '/state.js',
  '/streakmanager.js',
  '/streakrewarder.js',
  '/tableskinmanager.js',
  '/telemetryengine.js',
  '/thememanager.js',
  '/tileskinmanager.js',
  '/tournamenthub.js',
  '/tournamentmanager.js',
  '/trainingengine.js',
  '/tutorialmanager.js',
  '/ui.js',
  '/uianimator.js',
  '/utils.js'
];

self.addEventListener('install', event => {
    // skipWaiting força o novo SW a instalar imediatamente, sem esperar fechar a aba
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', event => {
    // Apaga os caches antigos para garantir que a versão nova entre no ar
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Assume o controle de todas as abas abertas
    );
});

self.addEventListener('fetch', event => {
    // Stale-While-Revalidate strategy for optimal performance
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