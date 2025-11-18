// Service Worker for VTS Basic
// Implements caching strategies for offline support and performance

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `vts-static-${CACHE_VERSION}`;
const COUNTRIES_CACHE = 'countries-api-cache';
const FLAGS_CACHE = 'flags-cache';

// Static assets to precache
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old static caches
          if (cacheName.startsWith('vts-static-') && cacheName !== STATIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Countries API - CacheFirst strategy
  if (url.origin === 'https://restcountries.com') {
    event.respondWith(
      cacheFirst(request, COUNTRIES_CACHE, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 10,
      })
    );
    return;
  }

  // Flag images - CacheFirst strategy
  if (url.origin === 'https://flagcdn.com') {
    event.respondWith(
      cacheFirst(request, FLAGS_CACHE, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 300,
      })
    );
    return;
  }

  // Static assets - CacheFirst strategy
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'font' ||
      request.destination === 'image') {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE)
    );
    return;
  }

  // HTML pages - NetworkFirst strategy
  if (request.destination === 'document') {
    event.respondWith(
      networkFirst(request, STATIC_CACHE)
    );
    return;
  }

  // Default: Network only
  event.respondWith(fetch(request));
});

/**
 * CacheFirst strategy: Try cache first, fallback to network
 */
async function cacheFirst(request, cacheName, options = {}) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      // Check if cached response is expired
      if (options.maxAge) {
        const cachedTime = new Date(cached.headers.get('sw-cached-time'));
        const now = new Date();
        if (now - cachedTime > options.maxAge) {
          console.log('[Service Worker] Cache expired, fetching fresh:', request.url);
          return fetchAndCache(request, cache, options);
        }
      }
      
      console.log('[Service Worker] Serving from cache:', request.url);
      return cached;
    }

    return fetchAndCache(request, cache, options);
  } catch (error) {
    console.error('[Service Worker] CacheFirst error:', error);
    return fetch(request);
  }
}

/**
 * NetworkFirst strategy: Try network first, fallback to cache
 */
async function networkFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      const response = await fetch(request);
      
      if (response.ok) {
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (networkError) {
      console.log('[Service Worker] Network failed, trying cache:', request.url);
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('[Service Worker] NetworkFirst error:', error);
    throw error;
  }
}

/**
 * Fetch from network and cache the response
 */
async function fetchAndCache(request, cache, options = {}) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Clone response and add cache timestamp
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      
      // Manage cache size if maxEntries is specified
      if (options.maxEntries) {
        await manageCacheSize(cache, options.maxEntries);
      }
      
      cache.put(request, cachedResponse);
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch error:', error);
    throw error;
  }
}

/**
 * Manage cache size by removing oldest entries
 */
async function manageCacheSize(cache, maxEntries) {
  const keys = await cache.keys();
  
  if (keys.length >= maxEntries) {
    // Remove oldest entry (first in the list)
    await cache.delete(keys[0]);
  }
}

console.log('[Service Worker] Loaded');
