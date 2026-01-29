import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Star, Trash2, Check, PlayCircle, Edit2, X, Save } from 'lucide-react';

const AnimeCard = ({ anime, isWatching, onUpdate, onDelete, isMobile = false }) => {
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
    
    const menuHeight = isWatching ? 200 : 100;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUpward = spaceBelow < menuHeight;
    
    return {
      position: 'fixed',
      ...(shouldOpenUpward 
        ? { bottom: window.innerHeight - rect.top + 5 + 'px' }
        : { top: rect.bottom + 5 + 'px' }
      ),
      left: isMobile ? '50%' : Math.max(10, rect.left - 140) + 'px',
      transform: isMobile ? 'translateX(-50%)' : 'none'
    };
  };

  // ========================================
  // VERSIÓN MÓVIL
  // ========================================
  if (isMobile) {
    const mobileStyles = {
      card: {
        background: '#1f2937',
        borderRadius: '0.75rem',
        padding: '1rem',
        border: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      },
      header: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      },
      image: {
        width: '60px',
        height: '85px',
        objectFit: 'cover',
        borderRadius: '0.5rem',
        border: '2px solid #374151',
        flexShrink: 0
      },
      info: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: 0
      },
      name: {
        fontWeight: '600',
        color: '#f9fafb',
        fontSize: '1rem',
        wordBreak: 'break-word'
      },
      tag: {
        display: 'inline-block',
        background: '#374151',
        color: '#c7d2fe',
        fontSize: '0.75rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontWeight: '500',
        width: 'fit-content'
      },
      actions: {
        display: 'flex',
        gap: '0.5rem',
        flexDirection: 'column'
      },
      episodeControls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: '#111827',
        borderRadius: '0.5rem',
        padding: '0.75rem'
      },
      episodeButton: {
        padding: '0.5rem',
        border: 'none',
        background: '#374151',
        cursor: 'pointer',
        borderRadius: '0.375rem',
        display: 'flex',
        alignItems: 'center',
        color: '#e5e7eb',
        transition: 'background-color 0.2s'
      },
      episodeNumber: {
        fontWeight: '700',
        fontSize: '1.25rem',
        color: '#f9fafb',
        minWidth: '50px',
        textAlign: 'center'
      },
      buttonGroup: {
        display: 'flex',
        gap: '0.5rem'
      },
      button: {
        flex: 1,
        padding: '0.75rem',
        border: '1px solid #374151',
        borderRadius: '0.5rem',
        background: 'transparent',
        color: '#e5e7eb',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s'
      },
      ratingStars: {
        display: 'flex',
        gap: '0.25rem',
        justifyContent: 'center'
      }
    };

    return (
      <>
        <div style={mobileStyles.card}>
          <div style={mobileStyles.header}>
            <img 
              src={anime.imagen_url || 'https://via.placeholder.com/70x100/374151/9ca3af?text=Anime'}
              alt={anime.nombre}
              style={mobileStyles.image}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/70x100/374151/9ca3af?text=Anime';
              }}
            />
            <div style={mobileStyles.info}>
              <div style={mobileStyles.name}>{anime.nombre}</div>
              <span style={mobileStyles.tag}>{anime.tipo}</span>
            </div>
          </div>

          <div style={mobileStyles.actions}>
            {isWatching ? (
              <>
                <div style={mobileStyles.episodeControls}>
                  <button 
                    onClick={() => handleUpdateCapitulos(-1)}
                    style={mobileStyles.episodeButton}
                    onMouseOver={(e) => e.target.style.background = '#4b5563'}
                    onMouseOut={(e) => e.target.style.background = '#374151'}
                  >
                    <ChevronDown size={24} />
                  </button>
                  <span style={mobileStyles.episodeNumber}>{anime.capitulos_vistos}</span>
                  <button 
                    onClick={() => handleUpdateCapitulos(1)}
                    style={mobileStyles.episodeButton}
                    onMouseOver={(e) => e.target.style.background = '#4b5563'}
                    onMouseOut={(e) => e.target.style.background = '#374151'}
                  >
                    <ChevronUp size={24} />
                  </button>
                </div>

                <div style={mobileStyles.buttonGroup}>
                  <button
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(anime.nombre + ' anime')}`, '_blank')}
                    style={mobileStyles.button}
                  >
                    🔍 Buscar
                  </button>
                  <button
                    ref={menuButtonRef}
                    onClick={() => setShowMenu(!showMenu)}
                    style={mobileStyles.button}
                  >
                    <MoreVertical size={18} /> Más
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={mobileStyles.ratingStars}>
                  {anime.estado === 'completado' && anime.calificacion > 0 ? (
                    [1,2,3,4,5].map(n => (
                      <Star 
                        key={n} 
                        size={20} 
                        style={{ 
                          fill: n <= anime.calificacion ? '#facc15' : 'none',
                          color: n <= anime.calificacion ? '#facc15' : '#d1d5db'
                        }}
                      />
                    ))
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {anime.estado === 'abandonado' ? 'Abandonado' : 'Sin calificar'}
                    </span>
                  )}
                </div>
                <span style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>
                  {anime.capitulos_vistos} capítulos vistos
                </span>
                <button
                  ref={menuButtonRef}
                  onClick={() => setShowMenu(!showMenu)}
                  style={{...mobileStyles.button, width: '100%'}}
                >
                  <MoreVertical size={18} /> Opciones
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menú desplegable (igual para móvil y desktop) */}
        {showMenu && (
          <div ref={menuRef} style={{
            ...getMenuPosition(),
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            minWidth: isMobile ? '200px' : '10rem'
          }}>
            {isWatching && (
              <>
                <button
                  onClick={() => handleMenuAction(() => setShowRating(true))}
                  style={{
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
                    fontSize: '0.875rem',
                    borderTopLeftRadius: '0.5rem',
                    borderTopRightRadius: '0.5rem'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#374151'}
                  onMouseOut={(e) => e.target.style.background = '#1f2937'}
                >
                  <Check size={16} /> Finalizado
                </button>
                <button
                  onClick={() => handleMenuAction(() => handleChangeEstado('abandonado'))}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: '#1f2937',
                    color: '#f59e0b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
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
                style={{
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
                  fontSize: '0.875rem',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#374151'}
                onMouseOut={(e) => e.target.style.background = '#1f2937'}
              >
                <PlayCircle size={16} /> Nueva Temporada
              </button>
            )}
            {anime.estado === 'abandonado' && (
              <button
                onClick={() => handleMenuAction(() => handleChangeEstado('viendo'))}
                style={{
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
                  fontSize: '0.875rem',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#374151'}
                onMouseOut={(e) => e.target.style.background = '#1f2937'}
              >
                <PlayCircle size={16} /> Retomar
              </button>
            )}
            <button
              onClick={() => handleMenuAction(() => onDelete(anime.id))}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                border: 'none',
                background: '#1f2937',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                borderTop: '1px solid #374151',
                borderBottomLeftRadius: '0.5rem',
                borderBottomRightRadius: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
        )}

        {/* Modal de calificación (igual para móvil y desktop) */}
        {showRating && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '1rem'
            }}
            onClick={() => setShowRating(false)}
          >
            <div 
              style={{
                background: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                maxWidth: '24rem',
                width: '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#1f2937',
                textAlign: 'center'
              }}>
                Califica "{anime.nombre}"
              </h3>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                justifyContent: 'center'
              }}>
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    style={{
                      padding: '0.5rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Star 
                      size={isMobile ? 36 : 32}
                      style={{ 
                        fill: n <= rating ? '#facc15' : 'none',
                        color: n <= rating ? '#facc15' : '#d1d5db'
                      }}
                    />
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowRating(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinish}
                  disabled={rating === 0}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: rating === 0 ? '#d1d5db' : '#9333ea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    cursor: rating === 0 ? 'not-allowed' : 'pointer'
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
  }

  // ========================================
  // VERSIÓN DESKTOP (código original)
  // ========================================
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
    editButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    iconButton: {
      padding: '0.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    }
  };

  return (
    <>
      <div style={styles.row}>
        <div style={styles.imageContainer}>
          <img 
            src={anime.imagen_url || 'https://via.placeholder.com/70x100/374151/9ca3af?text=Anime'}
            alt={anime.nombre}
            style={styles.image}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/70x100/374151/9ca3af?text=Anime';
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
              autoFocus
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

      {/* Menú y modal igual que arriba */}
      {showMenu && (
        <div ref={menuRef} style={{
          ...getMenuPosition(),
          background: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          minWidth: '10rem'
        }}>
          {isWatching && (
            <>
              <button
                onClick={() => handleMenuAction(() => setIsEditing(true))}
                style={{
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
                  fontSize: '0.875rem',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#374151'}
                onMouseOut={(e) => e.target.style.background = '#1f2937'}
              >
                <Edit2 size={16} /> Editar
              </button>
              <button
                onClick={() => handleMenuAction(() => setShowRating(true))}
                style={{
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
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.background = '#374151'}
                onMouseOut={(e) => e.target.style.background = '#1f2937'}
              >
                <Check size={16} /> Finalizado
              </button>
              <button
                onClick={() => handleMenuAction(() => handleChangeEstado('abandonado'))}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: '#1f2937',
                  color: '#f59e0b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
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
              style={{
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
                fontSize: '0.875rem',
                borderTopLeftRadius: '0.5rem',
                borderTopRightRadius: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              <PlayCircle size={16} /> Nueva Temporada
            </button>
          )}
          {anime.estado === 'abandonado' && (
            <button
              onClick={() => handleMenuAction(() => handleChangeEstado('viendo'))}
              style={{
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
                fontSize: '0.875rem',
                borderTopLeftRadius: '0.5rem',
                borderTopRightRadius: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.background = '#374151'}
              onMouseOut={(e) => e.target.style.background = '#1f2937'}
            >
              <PlayCircle size={16} /> Retomar
            </button>
          )}
          <button
            onClick={() => handleMenuAction(() => onDelete(anime.id))}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1rem',
              border: 'none',
              background: '#1f2937',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              borderTop: '1px solid #374151',
              borderBottomLeftRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem'
            }}
            onMouseOver={(e) => e.target.style.background = '#374151'}
            onMouseOut={(e) => e.target.style.background = '#1f2937'}
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}

      {showRating && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={() => setShowRating(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '24rem',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              Califica "{anime.nombre}"
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              justifyContent: 'center'
            }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  style={{
                    padding: '0.5rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowRating(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e5e7eb',
                  color: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleFinish}
                disabled={rating === 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: rating === 0 ? '#d1d5db' : '#9333ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: rating === 0 ? 'not-allowed' : 'pointer'
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