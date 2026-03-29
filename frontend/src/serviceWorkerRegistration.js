// ============================================
// SERVICE WORKER REGISTRATION
// Fix: apunta a sw-anime.js (no a service-worker.js)
// Fix: scope correcto para GitHub Pages /anime-tracker/
// ============================================

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Este navegador no soporta Service Workers');
    return;
  }

  window.addEventListener('load', () => {
    // Fix crítico #1: el nombre correcto es sw-anime.js, no service-worker.js
    // Fix crítico #2: PUBLIC_URL da el base path correcto (/anime-tracker en producción)
    const swUrl = `${process.env.PUBLIC_URL || ''}/sw-anime.js`;

    console.log('📋 Registrando SW desde:', swUrl);

    if (isLocalhost) {
      checkValidServiceWorker(swUrl, config);
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ SW activo en localhost');
      });
    } else {
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl, {
      // Fix: el scope debe coincidir con PUBLIC_URL para GitHub Pages
      scope: `${process.env.PUBLIC_URL || ''}/`
    })
    .then((registration) => {
      console.log('✅ SW registrado, scope:', registration.scope);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('🔄 Nueva versión del SW disponible');
              if (config?.onUpdate) config.onUpdate(registration);
            } else {
              console.log('📦 Contenido cacheado para uso offline');
              if (config?.onSuccess) config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ Error registrando SW:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType && !contentType.includes('javascript'))
      ) {
        // SW no encontrado — desregistrar y recargar
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('📡 Sin conexión — app en modo offline');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => console.error(error.message));
  }
}