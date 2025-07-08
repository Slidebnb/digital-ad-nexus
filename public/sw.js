// PWA Service Worker for offline functionality - Enhanced Version
const CACHE_NAME = 'kryptoanzeigen-v2';
const STATIC_CACHE = 'kryptoanzeigen-static-v2';
const DYNAMIC_CACHE = 'kryptoanzeigen-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/browse',
  '/categories',
  '/favorites',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: ['/', '/browse', '/categories', '/favorites'],
  // Network first for dynamic content
  NETWORK_FIRST: ['/api/', '/supabase/'],
  // Stale while revalidate for images
  STALE_WHILE_REVALIDATE: ['.jpg', '.jpeg', '.png', '.webp', '.svg']
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Cache install failed:', error);
      })
  );
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Cache-first strategy for static assets
    if (CACHE_STRATEGIES.CACHE_FIRST.some(path => pathname.startsWith(path))) {
      return await cacheFirst(request);
    }
    
    // Network-first strategy for API calls
    if (CACHE_STRATEGIES.NETWORK_FIRST.some(path => pathname.includes(path))) {
      return await networkFirst(request);
    }
    
    // Stale-while-revalidate for images
    if (CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(ext => pathname.includes(ext))) {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Network-first with cache fallback
    return await networkFirst(request);
    
  } catch (error) {
    console.error('SW: Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return await caches.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  const networkResponse = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {});
  
  // Return cached version immediately, or wait for network
  return cached || await fetchPromise;
}

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Activated successfully');
    })
  );
});

// Enhanced push notification event
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'KryptoAnzeigen.de';
  const options = {
    body: data.body || 'Neue Benachrichtigung verfügbar',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'kryptoanzeigen-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data
    },
    actions: [
      {
        action: 'view',
        title: 'Anzeigen',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Schließen'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('SW: Notification displayed successfully');
      })
      .catch((error) => {
        console.error('SW: Notification display failed:', error);
      })
  );
});

// Enhanced notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error('SW: Failed to handle notification click:', error);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync logic here
      Promise.resolve()
        .then(() => {
          console.log('SW: Background sync completed');
        })
        .catch((error) => {
          console.error('SW: Background sync failed:', error);
        })
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});