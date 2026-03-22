// ============================================================
// Service Worker - nootain.id
// Strategy: Cache-first for static assets, Network-first for data
// ============================================================

const CACHE_NAME = 'nootain-offline-v4';
const OFFLINE_URL = '/offline.html';

// All assets to precache on install
const PRECACHE_ASSETS = [
  // App shell routes
  '/',
  '/kasir',
  '/laporan',
  '/login',
  '/register',
  '/pengaturan',
  '/produk',

  // Static files
  '/offline.html',
  '/logo.webp',
  '/manifest.webmanifest',

  // Local FontAwesome (no CDN dependency)
  '/fontawesome/all.min.css',
  '/fontawesome/webfonts/fa-solid-900.woff2',
  '/fontawesome/webfonts/fa-regular-400.woff2',
  '/fontawesome/webfonts/fa-brands-400.woff2',
  '/fontawesome/webfonts/fa-v4compatibility.woff2',
];

// ─── Install: Precache all critical assets ───────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching critical assets...');
      // Use Promise.allSettled so one failure doesn't block the rest
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then((res) => {
              if (res.ok) {
                return cache.put(url, res);
              }
              console.warn('[SW] Skipped (non-ok):', url, res.status);
            })
            .catch((err) => {
              console.warn('[SW] Skipped (fetch error):', url, err.message);
            })
        )
      );
    })
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// ─── Activate: Clean up old caches ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: Route-based caching strategy ─────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests from same origin
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // ── Strategy 1: Cache-first for pure static assets ──────────
  if (
    path.startsWith('/_next/static/') ||
    path.startsWith('/fontawesome/') ||
    path.match(/\.(woff2?|ttf|otf|eot|ico|webp|png|jpg|jpeg|svg|gif)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return res;
          })
          .catch(() => {
            // If offline and not in cache, we can't do much for a static asset
            // but returning a "not found" style response is better than a promise rejection
            return new Response('Not found (offline)', { status: 404, statusText: 'Offline' });
          });
      })
    );
    return;
  }

  // ── Strategy 2: Network-first for Next.js data/RSC requests ─
  if (path.startsWith('/_next/data/') || url.searchParams.has('_rsc')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || new Response('Data unavailable (offline)', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // ── Strategy 3: Stale-while-revalidate for navigation ───────
  // Serve from cache immediately, update cache in background
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return res;
          })
          .catch(() => {
            // Offline and no cache match → show offline page
            return caches.match(OFFLINE_URL);
          });

        return cached || networkFetch;
      })
    );
    return;
  }

  // ── Strategy 4: Stale-while-revalidate for everything else ──
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached); // offline fallback to cache

      return cached || networkFetch;
    })
  );
});

// ─── Push Notifications ──────────────────────────────────────
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo.webp',
      badge: '/logo.webp',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
