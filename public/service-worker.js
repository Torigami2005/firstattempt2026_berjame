// Blue Links Alumni Portal - Service Worker with Advanced Caching Strategies
const CACHE_VERSION = 'blue-links-v2';
const CACHE_NAMES = {
  appShell: `${CACHE_VERSION}-app-shell`,
  images: `${CACHE_VERSION}-images`,
  api: `${CACHE_VERSION}-api`,
  fonts: `${CACHE_VERSION}-fonts`,
  documents: `${CACHE_VERSION}-documents`
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/offline.html'
];

const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// Install event - precache app shell and essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAMES.appShell).then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache fonts
      caches.open(CACHE_NAMES.fonts).then((cache) => {
        console.log('[Service Worker] Caching fonts');
        return cache.addAll(FONT_URLS).catch(() => {
          console.warn('[Service Worker] Some fonts failed to cache (may be offline)');
        });
      })
    ]).catch((error) => {
      console.error('[Service Worker] Installation failed:', error);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement multiple caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: Cache-First (for images and static assets)
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
    return event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.images));
  }

  // Strategy 2: Stale-While-Revalidate (for fonts and stylesheets)
  if (url.pathname.match(/\.(css|woff|woff2|ttf)$/i) || url.hostname === 'fonts.googleapis.com') {
    return event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAMES.fonts));
  }

  // Strategy 3: Network-First (for API calls and dynamic content)
  if (url.pathname.startsWith('/api/') || url.hostname !== url.origin) {
    return event.respondWith(networkFirstStrategy(request, CACHE_NAMES.api));
  }

  // Strategy 4: Cache-First with network fallback (for HTML documents)
  if (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    return event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.appShell));
  }

  // Default: Network-first with cache fallback
  return event.respondWith(networkFirstStrategy(request, CACHE_NAMES.documents));
});

// Cache-First Strategy: Check cache first, fallback to network
function cacheFirstStrategy(request, cacheName) {
  return caches.match(request).then((response) => {
    if (response) {
      console.log(`[Service Worker] Cache hit: ${request.url}`);
      return response;
    }
    return fetch(request).then((response) => {
      return cachePutIfValid(cacheName, request, response);
    }).catch(() => {
      console.log(`[Service Worker] Offline - cache miss: ${request.url}`);
      // Serve offline page for HTML requests
      if (request.headers.get('accept').includes('text/html')) {
        return caches.match('/offline.html');
      }
      return new Response('Offline - Resource not available', { status: 503 });
    });
  });
}

// Stale-While-Revalidate: Return cache immediately, update in background
function staleWhileRevalidateStrategy(request, cacheName) {
  return caches.match(request).then((response) => {
    const fetchPromise = fetch(request).then((networkResponse) => {
      return cachePutIfValid(cacheName, request, networkResponse);
    }).catch(() => {
      console.log(`[Service Worker] Update failed: ${request.url}`);
    });

    return response || fetchPromise;
  });
}

// Network-First Strategy: Try network first, fallback to cache
function networkFirstStrategy(request, cacheName) {
  return fetch(request)
    .then((response) => {
      return cachePutIfValid(cacheName, request, response);
    })
    .catch(() => {
      console.log(`[Service Worker] Network failed, using cache: ${request.url}`);
      return caches.match(request).then((cachedResponse) => {
        return cachedResponse || new Response('Offline - Resource not available', { status: 503 });
      });
    });
}

// Helper: Cache response if valid
function cachePutIfValid(cacheName, request, response) {
  // Don't cache failed responses
  if (!response || response.status !== 200 || response.type === 'error') {
    return response;
  }

  // Clone response as it can only be consumed once
  const responseToCache = response.clone();
  caches.open(cacheName).then((cache) => {
    cache.put(request, responseToCache);
    console.log(`[Service Worker] Cached: ${request.url} in ${cacheName}`);
  });

  return response;
}

// Handle messages from clients (e.g., skip waiting for updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Handle cache clear request
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      console.log('[Service Worker] All caches cleared');
    });
  }
});
