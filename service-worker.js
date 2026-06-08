// ============================================================
//  Camarai Dashboard — Service Worker
//  Estrategia:
//    · App shell          → Precache (install)
//    · Assets hasheados   → Cache First (velocidad)
//    · Google Fonts       → Cache First (velocidad)
//    · Llamadas a API     → Network Only (datos siempre frescos)
//    · Convex backend     → Network Only
//    · Navegación sin red → Página offline bloqueante
// ============================================================

const CACHE_NAME = 'camarai-dash-v1';
const OFFLINE_URL = '/offline.html';

// Archivos que se cachean en el install (app shell mínimo).
// Los bundles JS/CSS de Next.js se cachean dinámicamente con Cache First.
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/assets/icons/192x192.webp',
  '/assets/icons/512x512.webp',
];

// Cache separado para Google Fonts (no se invalida con el app shell)
const FONTS_CACHE = 'camarai-dash-fonts-v1';

// Rutas de tu API — estas NUNCA se cachean
const API_ORIGINS = [
  'https://dashboard.camarai.es/api',
  'https://www.camarai.es/api',
];

// Orígenes de Convex (backend) — NUNCA se cachean
const CONVEX_PATTERNS = [
  '.convex.cloud',
  'convex.dev',
];


// ─── INSTALL ────────────────────────────────────────────────
// Se ejecuta una sola vez al registrar el SW.
// Precachea el app shell y la página offline.

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precacheando app shell...');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});


// ─── ACTIVATE ───────────────────────────────────────────────
// Limpia cachés de versiones anteriores (excepto fonts).

self.addEventListener('activate', (event) => {
  const KEEP = [CACHE_NAME, FONTS_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !KEEP.includes(name))
          .map((name) => {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Toma control de todas las pestañas abiertas inmediatamente
  self.clients.claim();
});


// ─── HELPERS ────────────────────────────────────────────────

function isApiCall(url) {
  return (
    API_ORIGINS.some((origin) => url.href.startsWith(origin)) ||
    CONVEX_PATTERNS.some((pattern) => url.hostname.includes(pattern))
  );
}

function isGoogleFont(url) {
  return (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  );
}


// ─── FETCH ──────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no sean GET
  if (request.method !== 'GET') return;

  // Ignorar extensiones de Chrome y otros esquemas no-http
  if (!url.protocol.startsWith('http')) return;

  // ── 1. Llamadas a API / Convex → Network Only ─────────────
  if (isApiCall(url)) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'offline', message: 'Sin conexión a internet' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // ── 2. Google Fonts → Cache First (cache separado) ────────
  if (isGoogleFont(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(FONTS_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── 3. Navegación (HTML) → Network First con fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // ── 4. Assets estáticos → Cache First ─────────────────────
  // Los bundles de Next.js en /_next/static/ tienen hash en el nombre
  // así que es seguro cachearlos indefinidamente.

  // Ignorar peticiones de desarrollo de Next.js
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.includes('__nextjs_') ||
    url.searchParams.has('_rsc')
  ) {
    return; // Bypass SW
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Solo cachear respuestas válidas y del mismo origen
        if (
          !response ||
          response.status !== 200 ||
          (response.type !== 'basic' && response.type !== 'cors')
        ) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});


// ─── MENSAJE DESDE LA APP ────────────────────────────────────
// Permite forzar actualización del SW desde la app con:
// navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
