// ============================================
// HOOK PARA NOTIFICACIONES PUSH
// ============================================
// Guardar como: src/hooks/usePushNotifications.js

import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  // Verificar si ya hay una suscripción activa
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
        console.log('✅ Ya estás suscrito a notificaciones');
      }
    } catch (error) {
      console.error('Error verificando suscripción:', error);
    }
  };

  // Solicitar permiso y suscribirse
  const subscribe = async () => {
    try {
      // 1. Solicitar permiso
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        alert('❌ Necesitas permitir las notificaciones para recibir recordatorios');
        return null;
      }

      // 2. Registrar service worker si no está registrado
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker registrado');
      }

      await navigator.serviceWorker.ready;

      // 3. Obtener clave pública VAPID del backend
      const response = await fetch(`${API_URL}/api/push/vapid-public-key`);
      
      if (!response.ok) {
        throw new Error('Error obteniendo clave VAPID');
      }

      const { publicKey } = await response.json();

      if (!publicKey) {
        throw new Error('No se recibió clave VAPID del servidor');
      }

      // 4. Suscribirse a push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      console.log('✅ Suscripción creada:', sub);

      // 5. Guardar suscripción en el backend
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay sesión iniciada');
      }

      const saveResponse = await fetch(`${API_URL}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sub)
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Error guardando suscripción');
      }

      setSubscription(sub);
      setIsSubscribed(true);
      console.log('✅ Suscripción guardada en el servidor');

      return sub;

    } catch (error) {
      console.error('❌ Error al suscribirse:', error);
      alert('Error al activar notificaciones: ' + error.message);
      return null;
    }
  };

  // Cancelar suscripción
  const unsubscribe = async () => {
    try {
      if (!subscription) {
        console.log('No hay suscripción activa');
        return;
      }

      // Cancelar en el navegador
      await subscription.unsubscribe();

      // Eliminar del backend
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`${API_URL}/api/push/unsubscribe`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      setSubscription(null);
      setIsSubscribed(false);
      console.log('✅ Suscripción cancelada');

    } catch (error) {
      console.error('❌ Error al cancelar suscripción:', error);
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed,
    subscribe,
    unsubscribe
  };
};

// ============================================
// FUNCIÓN AUXILIAR - Convertir clave VAPID
// ============================================
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;