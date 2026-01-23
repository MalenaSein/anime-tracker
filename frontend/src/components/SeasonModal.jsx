import React from 'react';
const SeasonModal = ({ show, onClose, animes, onSelect }) => {
  if (!show) return null;

  const completedAnimes = animes.filter(a => a.estado === 'completado');

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    modal: {
      background: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      maxWidth: '28rem',
      width: '100%',
      margin: '0 1rem',
      maxHeight: '24rem',
      overflowY: 'auto'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#1f2937'
    },
    emptyMessage: {
      color: '#6b7280',
      textAlign: 'center',
      padding: '2rem 0'
    },
    animeList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    animeButton: {
      width: '100%',
      textAlign: 'left',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    animeName: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.25rem'
    },
    animeType: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    closeButton: {
      width: '100%',
      marginTop: '1rem',
      background: '#e5e7eb',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Seleccionar Anime Completado</h2>
        
        {completedAnimes.length === 0 ? (
          <p style={styles.emptyMessage}>
            No tienes animes completados aún
          </p>
        ) : (
          <div style={styles.animeList}>
            {completedAnimes.map(anime => (
              <button
                key={anime.id}
                onClick={() => onSelect(anime.id)}
                style={styles.animeButton}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#faf5ff';
                  e.currentTarget.style.borderColor = '#d8b4fe';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <div style={styles.animeName}>{anime.nombre}</div>
                <div style={styles.animeType}>{anime.tipo}</div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={styles.closeButton}
          onMouseOver={(e) => e.target.style.background = '#d1d5db'}
          onMouseOut={(e) => e.target.style.background = '#e5e7eb'}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default SeasonModal;