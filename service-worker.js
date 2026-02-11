// ============================================
// SERVICE WORKER PARA ANIME TRACKER PWA
// ============================================

const CACHE_NAME = 'anime-tracker-v1';
const RUNTIME_CACHE = 'anime-tracker-runtime-v1';

// Archivos que se cachearán durante la instalación
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ============================================
// INSTALACIÓN - Se ejecuta cuando se instala el SW
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Precaching archivos');
        // Cache solo los archivos que existen
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalado correctamente');
        return self.skipWaiting(); // Activa el SW inmediatamente
      })
      .catch((error) => {
        console.error('❌ Error en instalación:', error);
      })
  );
});

// ============================================
// ACTIVACIÓN - Limpia cachés antiguos
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Elimina cachés antiguos
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activado');
        return self.clients.claim(); // Toma control de todas las páginas
      })
  );
});

// ============================================
// FETCH - Estrategia de caché
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ❌ NO cachear requests a la API (backend)
  if (url.origin !== location.origin) {
    // Requests externos (API de Render) - solo red
    event.respondWith(fetch(request));
    return;
  }

  // ✅ Estrategia: Cache First para recursos estáticos
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ✅ Estrategia: Network First para HTML
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirst(request));
});

// ============================================
// ESTRATEGIA: Cache First (recursos estáticos)
// ============================================
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('📦 Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    
    // Solo cachear respuestas exitosas
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en fetch:', error);
    throw error;
  }
}

// ============================================
// ESTRATEGIA: Network First (HTML, documentos)
// ============================================
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    
    // Cachear la respuesta para uso offline
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🌐 Sin conexión, sirviendo desde caché:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Si no hay caché, devolver página offline básica
    if (request.destination === 'document') {
      const fallback = await cache.match('/index.html');
      if (fallback) return fallback;
    }
    
    throw error;
  }
}

// ============================================
// MENSAJES - Comunicación con la app
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏩ Actualizando Service Worker...');
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker cargado');