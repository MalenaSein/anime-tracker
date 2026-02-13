import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Convierte la clave VAPID de base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const NotificationButton = ({ isMobile = false }) => {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState('');

  useEffect(() => {
    const ok = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    if (ok) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch (e) {
      console.error('Error verificando suscripción:', e);
    }
  };

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    // 1. Pedir permiso
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== 'granted') {
      alert('Para recibir notificaciones de nuevos episodios, debes permitirlas en tu navegador.');
      return;
    }

    // 2. Registrar service worker
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw-anime.js');
    }
    await navigator.serviceWorker.ready;

    // 3. Obtener clave VAPID del backend
    const resp = await fetch(`${API_URL}/api/push/vapid-public-key`);
    if (!resp.ok) throw new Error('No se pudo obtener la clave del servidor');
    const { publicKey } = await resp.json();
    if (!publicKey) throw new Error('Clave VAPID no configurada en el servidor');

    // 4. Suscribirse
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    // 5. Guardar en backend
    const token = localStorage.getItem('token');
    const saveResp = await fetch(`${API_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sub)
    });
    if (!saveResp.ok) {
      const err = await saveResp.json();
      throw new Error(err.error || 'Error guardando suscripción');
    }

    setSubscribed(true);
    console.log('✅ Suscripción activada');
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) { setSubscribed(false); return; }

    await sub.unsubscribe();

    const token = localStorage.getItem('token');
    if (token) {
      await fetch(`${API_URL}/api/push/unsubscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint: sub.endpoint })
      });
    }

    setSubscribed(false);
    console.log('✅ Suscripción cancelada');
  };

  if (!supported) return null;

  // Si el permiso fue denegado definitivamente
  if (permission === 'denied') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'transparent', border: '1px solid #374151',
            borderRadius: '0.5rem', padding: isMobile ? '0.5rem' : '0.5rem 0.75rem',
            color: '#6b7280', cursor: 'not-allowed', fontSize: '0.8rem'
          }}
          title="Notificaciones bloqueadas en tu navegador. Ve a Configuración del sitio para habilitarlas."
          disabled
        >
          <BellOff size={16} />
          {!isMobile && <span>Bloqueadas</span>}
        </button>
      </div>
    );
  }

  const isActive = subscribed && permission === 'granted';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        disabled={loading}
        title={isActive ? 'Desactivar notificaciones de episodios' : 'Activar notificaciones de episodios'}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
          border: `1px solid ${isActive ? '#6366f1' : '#374151'}`,
          borderRadius: '0.5rem',
          padding: isMobile ? '0.5rem' : '0.5rem 0.75rem',
          color: isActive ? '#818cf8' : '#9ca3af',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '0.8rem', fontWeight: '500',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}
        onMouseOver={(e) => {
          if (!loading) e.currentTarget.style.borderColor = isActive ? '#818cf8' : '#6b7280';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = isActive ? '#6366f1' : '#374151';
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 16, height: 16, border: '2px solid #6366f1',
              borderTopColor: 'transparent', borderRadius: '50%',
              display: 'inline-block', animation: 'spin 0.7s linear infinite'
            }} />
            {!isMobile && <span>...</span>}
          </>
        ) : isActive ? (
          <>
            <BellRing size={16} />
            {!isMobile && <span>Notif. ON</span>}
          </>
        ) : (
          <>
            <Bell size={16} />
            {!isMobile && <span>Notif. OFF</span>}
          </>
        )}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default NotificationButton;