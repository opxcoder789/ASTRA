// Service Worker for Astra Website
// Implements caching strategies for better performance

const CACHE_NAME = 'astra-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Cache strategy based on resource type
  if (isStaticAsset(url)) {
    // Cache first, then network for static assets
    event.respondWith(cacheFirst(request));
  } else if (isImage(url)) {
    // Cache first for images
    event.respondWith(cacheFirst(request));
  } else if (isExternalScript(url)) {
    // Stale while revalidate for external scripts
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Network first for HTML and API calls
    event.respondWith(networkFirst(request));
  }
});

// Helper functions
function isStaticAsset(url) {
  return /\.(css|js|woff|woff2|ttf|otf)$/i.test(url.pathname);
}

function isImage(url) {
  return /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(url.pathname);
}

function isExternalScript(url) {
  return (url.hostname.includes('cdnjs.cloudflare.com') || 
          url.hostname.includes('cdn.jsdelivr.net') ||
          url.hostname.includes('googleapis.com'));
}

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}
