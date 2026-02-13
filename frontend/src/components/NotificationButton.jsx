// ============================================
// COMPONENTE: Botón de Notificaciones
// ============================================
// Guardar como: src/components/NotificationButton.jsx

import React from 'react';
import usePushNotifications from '../hooks/usePushNotifications';

const NotificationButton = () => {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  // Si el navegador no soporta notificaciones
  if (!isSupported) {
    return (
      <div className="notification-warning">
        <p>⚠️ Tu navegador no soporta notificaciones push</p>
        <small>Prueba con Chrome, Firefox o Edge</small>
      </div>
    );
  }

  // Si el usuario bloqueó las notificaciones
  if (permission === 'denied') {
    return (
      <div className="notification-blocked">
        <p>🔕 Notificaciones bloqueadas</p>
        <small>
          Para activarlas, ve a la configuración de tu navegador y permite las notificaciones para este sitio.
        </small>
      </div>
    );
  }

  return (
    <div className="notification-button-container">
      <h3>🔔 Notificaciones de episodios</h3>
      <p className="description">
        Recibe una notificación 1 minuto antes de que salga un nuevo episodio
      </p>

      <div className="button-group">
        {isSubscribed ? (
          <>
            <div className="status-active">
              <span className="indicator">✅</span>
              <span>Notificaciones activadas</span>
            </div>
            <button 
              onClick={unsubscribe} 
              className="btn btn-secondary"
            >
              🔕 Desactivar
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={subscribe} 
              className="btn btn-primary"
            >
              🔔 Activar notificaciones
            </button>
            <p className="hint">
              El navegador te pedirá permiso
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        .notification-button-container {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 20px 0;
        }

        h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 20px;
        }

        .description {
          color: #666;
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-active {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          color: #155724;
          font-weight: 500;
        }

        .indicator {
          font-size: 18px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .hint {
          color: #888;
          font-size: 13px;
          margin: 0;
          text-align: center;
        }

        .notification-warning,
        .notification-blocked {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 16px;
          border-radius: 8px;
          color: #856404;
        }

        .notification-warning p,
        .notification-blocked p {
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .notification-warning small,
        .notification-blocked small {
          display: block;
          color: #856404;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .notification-button-container {
            padding: 16px;
          }

          h3 {
            font-size: 18px;
          }

          .btn {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationButton;