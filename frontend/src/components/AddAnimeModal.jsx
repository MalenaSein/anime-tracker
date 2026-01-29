import React, { useState, useEffect } from 'react';

const ANIME_TYPES = [
  'Shonen', 'Shojo', 'Seinen', 'Josei', 'Kodomomuke',
  'Isekai', 'Mecha', 'Slice of Life', 'Romance', 'Comedia',
  'Drama', 'Acción', 'Aventura', 'Fantasía', 'Sci-Fi',
  'Horror', 'Misterio', 'Deportes', 'Musical', 'Ecchi',
  'Harem', 'Yaoi', 'Yuri', 'Supernatural', 'Otro'
];

const AddAnimeModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Shonen',
    capitulos_vistos: 0
  });

  // Efecto para manejar la tecla Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && show && formData.nombre.trim()) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, formData, onClose]);

  if (!show) return null;

  const handleSubmit = () => {
    if (formData.nombre.trim()) {
      onAdd(formData);
      setFormData({ nombre: '', tipo: 'Shonen', capitulos_vistos: 0 });
    }
  };

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
      margin: '0 1rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#1f2937'
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
      color: '#374151'
    },
    input: {
      width: '100%',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.5rem 0.75rem',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.5rem 0.75rem',
      fontSize: '1rem',
      boxSizing: 'border-box',
      background: 'white'
    },
    buttonContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1.5rem'
    },
    cancelButton: {
      flex: 1,
      background: '#e5e7eb',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    submitButton: {
      flex: 1,
      background: '#9333ea',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    hint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '1rem',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Agregar Nuevo Anime</h2>
        
        <div style={styles.formContainer}>
          <div>
            <label style={styles.label}>Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              style={styles.input}
              placeholder="Ej: Naruto Shippuden"
              required
              autoFocus
            />
          </div>

          <div>
            <label style={styles.label}>Tipo de Anime</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              style={styles.select}
            >
              {ANIME_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Capítulos Vistos</label>
            <input
              type="number"
              value={formData.capitulos_vistos}
              onChange={(e) => setFormData({...formData, capitulos_vistos: parseInt(e.target.value) || 0})}
              style={styles.input}
              min="0"
            />
          </div>

          <div style={styles.buttonContainer}>
            <button
              onClick={onClose}
              style={styles.cancelButton}
              onMouseOver={(e) => e.target.style.background = '#d1d5db'}
              onMouseOut={(e) => e.target.style.background = '#e5e7eb'}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              style={styles.submitButton}
              onMouseOver={(e) => e.target.style.background = '#7c3aed'}
              onMouseOut={(e) => e.target.style.background = '#9333ea'}
              disabled={!formData.nombre.trim()}
            >
              Agregar
            </button>
          </div>

          <p style={styles.hint}>
            💡 Presiona <strong>Enter</strong> para agregar o <strong>Esc</strong> para cancelar
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddAnimeModal;