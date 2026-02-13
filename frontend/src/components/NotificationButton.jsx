import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const NotificationButton = ({ isMobile = false }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission);
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) { console.log('[Notif] No hay SW registrado'); return; }
      const sub = await reg.pushManager.getSubscription();
      console.log('[Notif] Suscripcion existente:', sub ? 'SI' : 'NO');
      setSubscribed(!!sub);
    } catch (e) {
      console.error('[Notif] Error verificando suscripcion:', e);
    }
  };

  const handleToggle = async () => {
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      if (subscribed) {
        await doUnsubscribe();
      } else {
        await doSubscribe();
      }
    } catch (e) {
      console.error('[Notif] Error en toggle:', e);
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const doSubscribe = async () => {
    console.log('[Notif] === Iniciando suscripcion ===');

    // 1. Permiso
    console.log('[Notif] 1. Solicitando permiso...');
    const perm = await Notification.requestPermission();
    setPermission(perm);
    console.log('[Notif] Permiso:', perm);
    if (perm !== 'granted') {
      throw new Error('Permiso denegado. Habilitá las notificaciones en la configuración del navegador.');
    }

    // 2. Obtener SW registrado
    console.log('[Notif] 2. Buscando Service Worker...');
    let reg = await navigator.serviceWorker.getRegistration('/');
    if (!reg) {
      console.log('[Notif] SW no encontrado, registrando sw-anime.js...');
      reg = await navigator.serviceWorker.register('/sw-anime.js');
    }
    console.log('[Notif] SW encontrado:', reg.scope);

    // 3. Esperar a que el SW esté listo
    console.log('[Notif] 3. Esperando que SW esté activo...');
    const readyReg = await navigator.serviceWorker.ready;
    console.log('[Notif] SW listo:', readyReg.scope);

    // 4. Obtener clave VAPID
    console.log('[Notif] 4. Obteniendo clave VAPID de:', `${API_URL}/api/push/vapid-public-key`);
    const resp = await fetch(`${API_URL}/api/push/vapid-public-key`);
    console.log('[Notif] Respuesta VAPID status:', resp.status);
    if (!resp.ok) throw new Error(`Error obteniendo clave VAPID (status ${resp.status})`);
    const { publicKey } = await resp.json();
    console.log('[Notif] Clave VAPID recibida:', publicKey ? publicKey.substring(0, 20) + '...' : 'NULL/UNDEFINED');
    if (!publicKey) throw new Error('El servidor no tiene VAPID_PUBLIC_KEY configurada');

    // 5. Crear suscripcion push
    console.log('[Notif] 5. Creando suscripcion push...');
    const sub = await readyReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    console.log('[Notif] Suscripcion creada:', sub.endpoint.substring(0, 50) + '...');

    // 6. Guardar en backend
    console.log('[Notif] 6. Guardando suscripcion en backend...');
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay sesion iniciada (token null)');

    const saveResp = await fetch(`${API_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sub)
    });
    console.log('[Notif] Guardado status:', saveResp.status);

    if (!saveResp.ok) {
      const errData = await saveResp.json();
      throw new Error(`Error guardando: ${errData.error || saveResp.status}`);
    }

    const saveData = await saveResp.json();
    console.log('[Notif] Guardado OK:', saveData);

    setSubscribed(true);
    console.log('[Notif] === Suscripcion completada exitosamente ===');
  };

  const doUnsubscribe = async () => {
    console.log('[Notif] === Cancelando suscripcion ===');
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) { setSubscribed(false); return; }

    await sub.unsubscribe();
    console.log('[Notif] Desuscripto del navegador');

    const token = localStorage.getItem('token');
    if (token) {
      const resp = await fetch(`${API_URL}/api/push/unsubscribe`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ endpoint: sub.endpoint })
      });
      console.log('[Notif] Eliminado del backend, status:', resp.status);
    }
    setSubscribed(false);
  };

  if (!supported) {
    return (
      <div style={{ fontSize: '0.8rem', color: '#6b7280', padding: '0.5rem' }}>
        ⚠️ Tu navegador no soporta notificaciones push
      </div>
    );
  }

  const isActive = subscribed && permission === 'granted';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
      <button
        onClick={handleToggle}
        disabled={loading || permission === 'denied'}
        title={
          permission === 'denied'
            ? 'Notificaciones bloqueadas en tu navegador'
            : isActive
            ? 'Desactivar notificaciones'
            : 'Activar notificaciones de episodios'
        }
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
          border: `1px solid ${permission === 'denied' ? '#4b5563' : isActive ? '#6366f1' : '#374151'}`,
          borderRadius: '0.5rem',
          padding: isMobile ? '0.5rem' : '0.5rem 0.75rem',
          color: permission === 'denied' ? '#4b5563' : isActive ? '#818cf8' : '#9ca3af',
          cursor: loading || permission === 'denied' ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem', fontWeight: '500',
          transition: 'all 0.2s', whiteSpace: 'nowrap'
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 14, height: 14, border: '2px solid #6366f1',
              borderTopColor: 'transparent', borderRadius: '50%',
              display: 'inline-block', animation: 'nb-spin 0.7s linear infinite'
            }} />
            {!isMobile && <span>Conectando...</span>}
          </>
        ) : permission === 'denied' ? (
          <><BellOff size={16} />{!isMobile && <span>Bloqueadas</span>}</>
        ) : isActive ? (
          <><BellRing size={16} />{!isMobile && <span>Notif. ON</span>}</>
        ) : (
          <><Bell size={16} />{!isMobile && <span>Notif. OFF</span>}</>
        )}
      </button>

      {permission === 'denied' && (
        <span style={{ fontSize: '0.7rem', color: '#f59e0b', maxWidth: 200 }}>
          Habilitá notificaciones en config. del navegador
        </span>
      )}

      {errorMsg && (
        <span style={{ fontSize: '0.7rem', color: '#f87171', maxWidth: 200 }}>
          ⚠️ {errorMsg}
        </span>
      )}

      <style>{`@keyframes nb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NotificationButton;