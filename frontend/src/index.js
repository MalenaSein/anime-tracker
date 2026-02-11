import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ============================================
// 🔥 ACTIVAR SERVICE WORKER PARA PWA
// ============================================
// Cambiamos de unregister() a register()
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('✅ PWA lista para funcionar offline');
  },
  onUpdate: (registration) => {
    console.log('🔄 Nueva versión disponible');
    // Puedes mostrar un mensaje al usuario aquí
    if (window.confirm('Hay una actualización disponible. ¿Recargar?')) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
});