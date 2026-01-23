import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Star, Trash2, Check, PlayCircle, Edit2, X, Save } from 'lucide-react';

const AnimeCard = ({ anime, isWatching, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const [editedData, setEditedData] = useState({
    nombre: anime.nombre,
    tipo: anime.tipo
  });

  const ANIME_TYPES = [
    'Shonen', 'Shojo', 'Seinen', 'Josei', 'Kodomomuke',
    'Isekai', 'Mecha', 'Slice of Life', 'Romance', 'Comedia',
    'Drama', 'Acción', 'Aventura', 'Fantasía', 'Sci-Fi',
    'Horror', 'Misterio', 'Deportes', 'Musical', 'Ecchi',
    'Harem', 'Yaoi', 'Yuri', 'Supernatural', 'Otro'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && 
          menuButtonRef.current && 
          !menuButtonRef.current.contains(event.target) &&
          menuRef.current &&
          !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleUpdateCapitulos = async (delta) => {
    const newCaps = Math.max(0, anime.capitulos_vistos + delta);
    await onUpdate(anime.id, { 
      capitulos_vistos: newCaps,
      estado: anime.estado,
      calificacion: anime.calificacion,
      nombre: anime.nombre
    });
  };

  const handleChangeEstado = async (nuevoEstado, calificacion = 0) => {
    await onUpdate(anime.id, { 
      capitulos_vistos: anime.capitulos_vistos,
      estado: nuevoEstado, 
      calificacion,
      nombre: anime.nombre
    });
  };

  const handleFinish = async () => {
    await handleChangeEstado('completado', rating);
    setShowRating(false);
    setRating(0);
  };

  const handleSaveEdit = async () => {
    if (editedData.nombre.trim()) {
      await onUpdate(anime.id, { 
        nombre: editedData.nombre.trim(),
        tipo: editedData.tipo,
        capitulos_vistos: anime.capitulos_vistos,
        estado: anime.estado,
        calificacion: anime.calificacion 
      });
      setIsEditing(false);
    }
  };

  const handleMenuAction = async (action) => {
    setShowMenu(false);
    await new Promise(resolve => setTimeout(resolve, 50));
    action();
  };

  const getMenuPosition = () => {
    if (!menuButtonRef.current) return { top: 0, left: 0 };
    const rect = menuButtonRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 5 + 'px',
      left: Math.max(10, rect.left - 140) + 'px'
    };
  };

  const styles = {
    row: {
      display: 'grid',
      gridTemplateColumns: isWatching 
        ? '80px 1fr 150px 150px 120px 100px' 
        : '80px 1fr 150px 150px 120px 140px 100px',
      gap: '1rem',
      padding: '1rem',
      borderBottom: '1px solid #374151',
      alignItems: 'center',
      background: '#1f2937',
      transition: 'background-color 0.2s'
    },
    imageContainer: {
      width: '70px',
      height: '100px'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '0.375rem',
      border: '2px solid #374151'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #374151',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      boxSizing: 'border-box',
      background: '#111827',
      color: '#e5e7eb'
    },
    select: {
      width: '100%',
      padding: '0.375rem',
      border: '1px solid #374151',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      background: '#111827',
      color: '#e5e7eb',
      boxSizing: 'border-box'
    },
    name: {
      fontWeight: '500',
      color: '#f9fafb',
      fontSize: '0.9rem'
    },
    tag: {
      display: 'inline-block',
      background: '#374151',
      color: '#c7d2fe',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontWeight: '500'
    },
    capitulosControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: '#111827',
      borderRadius: '0.5rem',
      padding: '0.25rem 0.5rem',
      width: 'fit-content'
    },
    capitulosButton: {
      padding: '0.25rem',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s',
      color: '#e5e7eb'
    },
    capitulosNumber: {
      fontWeight: '600',
      fontSize: '1rem',
      minWidth: '40px',
      textAlign: 'center',
      color: '#f9fafb'
    },
    link: {
      color: '#6366f1',
      fontSize: '0.875rem',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    starContainer: {
      display: 'flex',
      gap: '0.25rem'
    },
    menuButton: {
      padding: '0.375rem',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: '0.25rem',
      transition: 'background-color 0.2s'
    },
    menuDropdown: {
      ...getMenuPosition(),
      background: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      minWidth: '10rem'
    },
    menuItem: {
      width: '100%',
      textAlign: 'left',
      padding: '0.75rem 1rem',
      border: 'none',
      background: '#1f2937',
      color: '#e5e7eb',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background-color 0.2s',
      fontSize: '0.875rem',
      fontFamily: 'inherit'
    },
    menuItemFirst: {
      borderTopLeftRadius: '0.5rem',
      borderTopRightRadius: '0.5rem'
    },
    menuItemLast: {
      borderBottomLeftRadius: '0.5rem',
      borderBottomRightRadius: '0.5rem'
    },
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
      maxWidth: '24rem',
      width: '100%',
      margin: '0 1rem'
    },
    modalTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#1f2937'
    },
    starsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    starButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      padding: 0
    },
    modalButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      flex: 1,
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    editButtons: {
      display: 'flex',
      gap: '0.25rem'
    },
    iconButton: {
      padding: '0.375rem',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'opacity 0.2s'
    }
  };

  return (
    <>
      <div 
        style={styles.row}
        onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
        onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}
      >
        <div style={styles.imageContainer}>
          <img 
            src={anime.imagen_url || 'https://via.placeholder.com/70x100/9333ea/ffffff?text=Anime'} 
            alt={anime.nombre}
            style={styles.image}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/70x100/9333ea/ffffff?text=Anime';
            }}
          />
        </div>

        <div>
          {isEditing ? (
            <input
              type="text"
              value={editedData.nombre}
              onChange={(e) => setEditedData({ ...editedData, nombre: e.target.value })}
              style={styles.input}
            />
          ) : (
            <div style={styles.name}>{anime.nombre}</div>
          )}
        </div>

        <div>
          {isEditing ? (
            <select
              value={editedData.tipo}
              onChange={(e) => setEditedData({ ...editedData, tipo: e.target.value })}
              style={styles.select}
            >
              {ANIME_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          ) : (
            <span style={styles.tag}>{anime.tipo}</span>
          )}
        </div>

        <div>
          {isWatching ? (
            <div style={styles.capitulosControls}>
              <button 
                onClick={() => handleUpdateCapitulos(-1)}
                style={styles.capitulosButton}
                onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                <ChevronDown size={18} />
              </button>
              <span style={styles.capitulosNumber}>{anime.capitulos_vistos}</span>
              <button 
                onClick={() => handleUpdateCapitulos(1)}
                style={styles.capitulosButton}
                onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                <ChevronUp size={18} />
              </button>
            </div>
          ) : (
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {anime.capitulos_vistos} caps
            </span>
          )}
        </div>

        <div>
          <a 
            href={`https://www.google.com/search?q=${encodeURIComponent(anime.nombre + ' anime')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            🔍 Google
          </a>
        </div>

        {!isWatching && (
          <div style={styles.starContainer}>
            {anime.estado === 'completado' && anime.calificacion > 0 ? (
              [1,2,3,4,5].map(n => (
                <Star 
                  key={n} 
                  size={16} 
                  style={{ 
                    fill: n <= anime.calificacion ? '#facc15' : 'none',
                    color: n <= anime.calificacion ? '#facc15' : '#d1d5db'
                  }}
                />
              ))
            ) : (
              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                {anime.estado === 'abandonado' ? 'Abandonado' : 'Sin calificar'}
              </span>
            )}
          </div>
        )}

        <div>
          {isEditing ? (
            <div style={styles.editButtons}>
              <button
                onClick={handleSaveEdit}
                style={{ ...styles.iconButton, background: '#10b981', color: 'white' }}
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedData({
                    nombre: anime.nombre,
                    tipo: anime.tipo
                  });
                }}
                style={{ ...styles.iconButton, background: '#ef4444', color: 'white' }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              style={styles.menuButton}
              onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              <MoreVertical size={20} style={{ color: '#6b7280' }} />
            </button>
          )}
        </div>
      </div>

      {showMenu && (
        <div ref={menuRef} style={styles.menuDropdown}>
          {isWatching && (
            <>
              <button
                onClick={() => handleMenuAction(() => setIsEditing(true))}
                style={{ ...styles.menuItem, ...styles.menuItemFirst }}
                onMouseOver={(e) => e.target.style.background = '#374151'}
                onMouseOut={(e) => e.target.style.background = '#1f2937'}
              >
                <Edit2 size={16} /> Editar
              </button>
              <button
                onClick={() => handleMenuAction(() => setShowRating(true))}
                style={styles.menuItem}
                onMouseOver={(e) => e.target.style.background = '#374151'}
                onMouseOut={(e) => e.target.style.background = '#1f2937'}
              >
                <Check size={16} /> Finalizado
              </button>
              <button
                onClick={() => handleMenuAction(() => handleChangeEstado('abandonado'))}
                style={{ ...styles.menuItem, color: '#f59e0b' }}
                onMouseOver={(e) => e.target.style.background = '#374151'}
                onMouseOut={(e) => e.target.style.background = '#1f2937'}
              >
                <Trash2 size={16} /> Abandonar
              </button>
            </>
          )}
          {anime.estado === 'completado' && (
            <button
              onClick={() => handleMenuAction(() => handleChangeEstado('viendo', 0))}
              style={{ ...styles.menuItem, ...styles.menuItemFirst }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              <PlayCircle size={16} /> Nueva Temporada
            </button>
          )}
          {anime.estado === 'abandonado' && (
            <button
              onClick={() => handleMenuAction(() => handleChangeEstado('viendo'))}
              style={{ ...styles.menuItem, ...styles.menuItemFirst }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              <PlayCircle size={16} /> Retomar
            </button>
          )}
          <button
            onClick={() => handleMenuAction(() => onDelete(anime.id))}
            style={{ 
              ...styles.menuItem, 
              ...styles.menuItemLast,
              color: '#ef4444', 
              borderTop: '1px solid #374151' 
            }}
            onMouseOver={(e) => e.target.style.background = '#374151'}
            onMouseOut={(e) => e.target.style.background = '#1f2937'}
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}

      {showRating && (
        <div style={styles.overlay} onClick={() => setShowRating(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Califica "{anime.nombre}"</h3>
            <div style={styles.starsContainer}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  style={styles.starButton}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Star 
                    size={32} 
                    style={{ 
                      fill: n <= rating ? '#facc15' : 'none',
                      color: n <= rating ? '#facc15' : '#d1d5db'
                    }}
                  />
                </button>
              ))}
            </div>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowRating(false)}
                style={{ ...styles.actionButton, background: '#e5e7eb', color: '#1f2937' }}
                onMouseOver={(e) => e.target.style.background = '#d1d5db'}
                onMouseOut={(e) => e.target.style.background = '#e5e7eb'}
              >
                Cancelar
              </button>
              <button
                onClick={handleFinish}
                disabled={rating === 0}
                style={{ 
                  ...styles.actionButton, 
                  background: rating === 0 ? '#d1d5db' : '#9333ea', 
                  color: 'white',
                  cursor: rating === 0 ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (rating > 0) e.target.style.background = '#7c3aed';
                }}
                onMouseOut={(e) => {
                  if (rating > 0) e.target.style.background = '#9333ea';
                }}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnimeCard;