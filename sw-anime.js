// ============================================
// SERVICE WORKER - ANIME TRACKER PWA
// Fix: rutas corregidas para GitHub Pages (/anime-tracker/)
// Fix: push notifications funcionan con app cerrada
// ============================================

const CACHE_NAME = 'anime-tracker-v2';
const RUNTIME_CACHE = 'anime-tracker-runtime-v2';
const BASE_PATH = '/anime-tracker'; // ← Fix crítico para GitHub Pages

// ============================================
// INSTALACIÓN
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Fix: rutas con el base path correcto de GitHub Pages
        return cache.addAll([
          `${BASE_PATH}/`,
          `${BASE_PATH}/index.html`,
          `${BASE_PATH}/manifest.json`,
          `${BASE_PATH}/icons/icon-192x192.png`,
          `${BASE_PATH}/icons/icon-512x512.png`,
        ]).catch((err) => {
          console.warn('⚠️ Algunos archivos no se pudieron cachear:', err);
        });
      })
      .then(() => {
        console.log('✅ SW: Instalado');
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVACIÓN
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🎯 SW: Activando...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('🗑️ Eliminando caché viejo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('✅ SW: Activado');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH - Estrategia de caché
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear requests al backend (Render)
  if (url.origin !== location.origin) {
    event.respondWith(fetch(request).catch(() => {
      return new Response(JSON.stringify({ error: 'Sin conexión' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }));
    return;
  }

  // Cache First para estáticos
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network First para HTML
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.status === 200) cache.put(request, response.clone());
    return response;
  } catch (error) {
    throw error;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.status === 200) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Fallback al index.html para navegación SPA
    const fallback = await cache.match(`${BASE_PATH}/index.html`)
      || await cache.match(`${BASE_PATH}/`);
    if (fallback) return fallback;

    throw new Error('Sin conexión y sin caché');
  }
}

// ============================================
// MENSAJES
// ============================================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================
// PUSH NOTIFICATIONS
// Fix: event.waitUntil es lo que permite que funcione
// con la app cerrada — ya estaba bien, pero faltaba
// que el SW estuviera correctamente registrado
// ============================================
self.addEventListener('push', (event) => {
  console.log('📩 Push recibido (app puede estar cerrada)');

  let data = {
    title: '🎬 Anime Tracker',
    body: 'Nuevo episodio disponible',
    icon: `${BASE_PATH}/icons/icon-192x192.png`,
    badge: `${BASE_PATH}/icons/icon-192x192.png`,
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || 'anime-notification',
    data: {
      url: `${BASE_PATH}/`,   // Fix: URL correcta con base path
      ...(data.data || {})
    },
    actions: data.actions || [
      { action: 'open', title: 'Ver ahora' },
      { action: 'dismiss', title: 'Cerrar' }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true,
    silent: false,
    renotify: true,
  };

  // event.waitUntil es CRÍTICO — le dice al browser
  // que mantenga el SW vivo hasta que la notificación se muestre
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================
// NOTIFICATION CLICK
// Fix: usa BASE_PATH correcto para abrir la app
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación, action:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  // Fix: URL con base path de GitHub Pages
  const targetUrl = event.notification.data?.url || `${BASE_PATH}/`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta de la app, enfocarla
        for (const client of clientList) {
          if (client.url.includes(BASE_PATH) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir nueva ventana
        return clients.openWindow(targetUrl);
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada:', event.notification.tag);
});

console.log('🚀 SW cargado — scope:', self.registration?.scope);