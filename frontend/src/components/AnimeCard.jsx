import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Star, Trash2, Check, PlayCircle, Edit2, X, Save, Clock } from 'lucide-react';

const ANIME_TYPES = [
  'Shonen', 'Shojo', 'Seinen', 'Josei', 'Kodomomuke',
  'Isekai', 'Mecha', 'Slice of Life', 'Romance', 'Comedia',
  'Drama', 'Acción', 'Aventura', 'Fantasía', 'Sci-Fi',
  'Horror', 'Misterio', 'Deportes', 'Musical', 'Ecchi',
  'Harem', 'Yaoi', 'Yuri', 'Supernatural', 'Otro'
];

const AnimeCard = ({ anime, isWatching, onUpdate, onDelete, isMobile = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  // FIX CRÍTICO: editedData siempre se inicializa con el tipo actual del anime
  const [editedData, setEditedData] = useState({
    nombre: anime.nombre,
    tipo: anime.tipo,
    capitulos_vistos: anime.capitulos_vistos,
    calificacion: anime.calificacion || 0
  });

  // FIX: sincronizar si el anime cambia externamente
  useEffect(() => {
    if (!isEditing) {
      setEditedData({
        nombre: anime.nombre,
        tipo: anime.tipo,
        capitulos_vistos: anime.capitulos_vistos,
        calificacion: anime.calificacion || 0
      });
    }
  }, [anime.nombre, anime.tipo, anime.capitulos_vistos, anime.calificacion, isEditing]);

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
      nombre: anime.nombre,
      tipo: anime.tipo  // FIX: siempre incluir tipo
    });
  };

  const handleChangeEstado = async (nuevoEstado, calificacion = null) => {
    await onUpdate(anime.id, {
      capitulos_vistos: anime.capitulos_vistos,
      estado: nuevoEstado,
      calificacion: calificacion !== null ? calificacion : anime.calificacion,
      nombre: anime.nombre,
      tipo: anime.tipo  // FIX: siempre incluir tipo
    });
  };

  const handleFinish = async () => {
    await handleChangeEstado('completado', rating);
    setShowRating(false);
    setRating(0);
  };

  // FIX CRÍTICO: handleSaveEdit envía tipo correctamente
  const handleSaveEdit = async () => {
    if (editedData.nombre.trim()) {
      await onUpdate(anime.id, {
        nombre: editedData.nombre.trim(),
        tipo: editedData.tipo,   // ← aquí está el fix del tipo
        capitulos_vistos: editedData.capitulos_vistos,
        estado: anime.estado,
        calificacion: editedData.calificacion || anime.calificacion
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({
      nombre: anime.nombre,
      tipo: anime.tipo,
      capitulos_vistos: anime.capitulos_vistos,
      calificacion: anime.calificacion || 0
    });
  };

  const handleMenuAction = async (action) => {
    setShowMenu(false);
    await new Promise(resolve => setTimeout(resolve, 50));
    action();
  };

  const getMenuPosition = () => {
    if (!menuButtonRef.current) return { top: 0, left: 0 };
    const rect = menuButtonRef.current.getBoundingClientRect();
    const menuHeight = 200;
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

  // ✨ NUEVO: puede editar si está viendo, completado O abandonado
  const canEdit = anime.estado === 'viendo' || anime.estado === 'completado' || anime.estado === 'abandonado';

  // ========================================
  // VERSIÓN MÓVIL
  // ========================================
  if (isMobile) {
    const mobileStyles = {
      card: {
        background: '#1f2937', borderRadius: '0.75rem', padding: '1rem',
        border: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '1rem'
      },
      header: { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
      image: {
        width: '60px', height: '85px', objectFit: 'cover',
        borderRadius: '0.5rem', border: '2px solid #374151', flexShrink: 0
      },
      info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 },
      name: { fontWeight: '600', color: '#f9fafb', fontSize: '1rem', wordBreak: 'break-word' },
      tag: {
        display: 'inline-block', background: '#374151', color: '#c7d2fe',
        fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
        fontWeight: '500', width: 'fit-content'
      },
      editInput: {
        width: '100%', padding: '0.5rem', border: '1px solid #6366f1',
        borderRadius: '0.375rem', fontSize: '0.875rem', background: '#111827',
        color: '#e5e7eb', boxSizing: 'border-box', marginBottom: '0.25rem'
      },
      editSelect: {
        width: '100%', padding: '0.5rem', border: '1px solid #6366f1',
        borderRadius: '0.375rem', fontSize: '0.875rem', background: '#111827',
        color: '#e5e7eb', boxSizing: 'border-box'
      },
      button: {
        flex: 1, padding: '0.75rem', border: '1px solid #374151', borderRadius: '0.5rem',
        background: 'transparent', color: '#e5e7eb', fontSize: '0.875rem', fontWeight: '500',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.5rem', transition: 'all 0.2s'
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
              onError={(e) => { e.target.src = 'https://via.placeholder.com/70x100/374151/9ca3af?text=Anime'; }}
            />
            <div style={mobileStyles.info}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editedData.nombre}
                    onChange={(e) => setEditedData({ ...editedData, nombre: e.target.value })}
                    style={mobileStyles.editInput}
                    autoFocus
                  />
                  <select
                    value={editedData.tipo}
                    onChange={(e) => setEditedData({ ...editedData, tipo: e.target.value })}
                    style={mobileStyles.editSelect}
                  >
                    {ANIME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="number"
                    value={editedData.capitulos_vistos}
                    onChange={(e) => setEditedData({ ...editedData, capitulos_vistos: parseInt(e.target.value) || 0 })}
                    style={{ ...mobileStyles.editInput, marginTop: '0.25rem' }}
                    min="0"
                    placeholder="Capítulos vistos"
                  />
                </>
              ) : (
                <>
                  <div style={mobileStyles.name}>{anime.nombre}</div>
                  <span style={mobileStyles.tag}>{anime.tipo}</span>
                  {anime.estado === 'completado' || anime.estado === 'abandonado' ? (
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{anime.capitulos_vistos} caps</span>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleSaveEdit}
                  style={{ ...mobileStyles.button, background: '#10b981', border: 'none', color: 'white' }}
                >
                  <Save size={16} /> Guardar
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{ ...mobileStyles.button, background: '#ef4444', border: 'none', color: 'white' }}
                >
                  <X size={16} /> Cancelar
                </button>
              </div>
            ) : isWatching ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                  background: '#111827', borderRadius: '0.5rem', padding: '0.75rem'
                }}>
                  <button onClick={() => handleUpdateCapitulos(-1)}
                    style={{ padding: '0.5rem', border: 'none', background: '#374151', cursor: 'pointer', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', color: '#e5e7eb' }}>
                    <ChevronDown size={24} />
                  </button>
                  <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#f9fafb', minWidth: '50px', textAlign: 'center' }}>
                    {anime.capitulos_vistos}
                  </span>
                  <button onClick={() => handleUpdateCapitulos(1)}
                    style={{ padding: '0.5rem', border: 'none', background: '#374151', cursor: 'pointer', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', color: '#e5e7eb' }}>
                    <ChevronUp size={24} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(anime.nombre + ' anime')}`, '_blank')} style={mobileStyles.button}>🔍 Buscar</button>
                  <button ref={menuButtonRef} onClick={() => setShowMenu(!showMenu)} style={mobileStyles.button}><MoreVertical size={18} /> Más</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                  {anime.estado === 'completado' && anime.calificacion > 0 ? (
                    [1,2,3,4,5].map(n => (
                      <Star key={n} size={20} style={{ fill: n <= anime.calificacion ? '#facc15' : 'none', color: n <= anime.calificacion ? '#facc15' : '#d1d5db' }} />
                    ))
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {anime.estado === 'abandonado' ? 'Abandonado' : anime.estado === 'por_ver' ? 'Por ver' : 'Sin calificar'}
                    </span>
                  )}
                </div>
                <span style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>
                  {anime.capitulos_vistos} capítulos vistos
                </span>
                <button ref={menuButtonRef} onClick={() => setShowMenu(!showMenu)}
                  style={{ ...mobileStyles.button, width: '100%' }}>
                  <MoreVertical size={18} /> Opciones
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menú desplegable */}
        {showMenu && (
          <div ref={menuRef} style={{
            ...getMenuPosition(), background: '#1f2937', border: '1px solid #374151',
            borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            zIndex: 9999, minWidth: '200px'
          }}>
            {/* ✨ Editar disponible en completado y abandonado también */}
            {canEdit && (
              <button
                onClick={() => handleMenuAction(() => setIsEditing(true))}
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: '#1f2937', color: '#e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}
              >
                <Edit2 size={16} /> Editar
              </button>
            )}
            {isWatching && (
              <>
                <button onClick={() => handleMenuAction(() => setShowRating(true))}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: '#1f2937', color: '#e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
                  <Check size={16} /> Finalizado
                </button>
                <button onClick={() => handleMenuAction(() => handleChangeEstado('abandonado'))}
                  style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: '#1f2937', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
                  <Trash2 size={16} /> Abandonar
                </button>
              </>
            )}
            {anime.estado === 'completado' && (
              <button onClick={() => handleMenuAction(() => handleChangeEstado('viendo', 0))}
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: '#1f2937', color: '#e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
                <PlayCircle size={16} /> Nueva Temporada
              </button>
            )}
            {anime.estado === 'abandonado' && (
              <button onClick={() => handleMenuAction(() => handleChangeEstado('viendo'))}
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: '#1f2937', color: '#e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
                <PlayCircle size={16} /> Retomar
              </button>
            )}
            {anime.estado === 'por_ver' && (
              <button onClick={() => handleMenuAction(() => handleChangeEstado('viendo'))}
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: '#1f2937', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
                <PlayCircle size={16} /> Empezar a ver
              </button>
            )}
            <button onClick={() => handleMenuAction(() => onDelete(anime.id))}
              style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: '#1f2937', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', borderTop: '1px solid #374151', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
        )}

        {/* Modal calificación */}
        {showRating && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}
            onClick={() => setShowRating(false)}>
            <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '24rem', width: '100%' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937', textAlign: 'center' }}>Califica "{anime.nombre}"</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Star size={36} style={{ fill: n <= rating ? '#facc15' : 'none', color: n <= rating ? '#facc15' : '#d1d5db' }} />
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setShowRating(false)} style={{ flex: 1, padding: '0.75rem', background: '#e5e7eb', color: '#1f2937', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleFinish} disabled={rating === 0} style={{ flex: 1, padding: '0.75rem', background: rating === 0 ? '#d1d5db' : '#9333ea', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: rating === 0 ? 'not-allowed' : 'pointer' }}>Finalizar</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ========================================
  // VERSIÓN DESKTOP
  // ========================================
  const isNotWatching = !isWatching;
  const styles = {
    row: {
      display: 'grid',
      gridTemplateColumns: isWatching
        ? '80px 1fr 150px 150px 120px 100px'
        : '80px 1fr 150px 150px 120px 140px 100px',
      gap: '1rem', padding: '1rem', borderBottom: '1px solid #374151',
      alignItems: 'center', background: '#1f2937', transition: 'background-color 0.2s'
    },
    image: { width: '70px', height: '100px', objectFit: 'cover', borderRadius: '0.375rem', border: '2px solid #374151' },
    input: { width: '100%', padding: '0.5rem', border: '1px solid #6366f1', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box', background: '#111827', color: '#e5e7eb' },
    select: { width: '100%', padding: '0.375rem', border: '1px solid #6366f1', borderRadius: '0.375rem', fontSize: '0.75rem', background: '#111827', color: '#e5e7eb', boxSizing: 'border-box' },
    capsInput: { width: '80px', padding: '0.375rem', border: '1px solid #6366f1', borderRadius: '0.375rem', fontSize: '0.875rem', background: '#111827', color: '#e5e7eb', textAlign: 'center' },
    name: { fontWeight: '500', color: '#f9fafb', fontSize: '0.9rem' },
    tag: { display: 'inline-block', background: '#374151', color: '#c7d2fe', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: '500' },
    capitulosControls: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111827', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', width: 'fit-content' },
    capitulosButton: { padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', transition: 'background-color 0.2s', color: '#e5e7eb' },
    capitulosNumber: { fontWeight: '600', fontSize: '1rem', minWidth: '40px', textAlign: 'center', color: '#f9fafb' },
    link: { color: '#6366f1', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    starContainer: { display: 'flex', gap: '0.25rem' },
    menuButton: { padding: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '0.25rem', transition: 'background-color 0.2s' },
    iconButton: { padding: '0.5rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
  };

  const menuItemStyle = (color = '#e5e7eb', isFirst = false, isLast = false) => ({
    width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none',
    background: '#1f2937', color, cursor: 'pointer', display: 'flex',
    alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem',
    ...(isFirst ? { borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' } : {}),
    ...(isLast ? { borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', borderTop: '1px solid #374151' } : {})
  });

  return (
    <>
      <div style={styles.row}>
        <div><img src={anime.imagen_url || 'https://via.placeholder.com/70x100/374151/9ca3af?text=Anime'} alt={anime.nombre} style={styles.image} onError={(e) => { e.target.src = 'https://via.placeholder.com/70x100/374151/9ca3af?text=Anime'; }} /></div>

        <div>
          {isEditing ? (
            <input type="text" value={editedData.nombre} onChange={(e) => setEditedData({ ...editedData, nombre: e.target.value })} style={styles.input} autoFocus />
          ) : (
            <div style={styles.name}>{anime.nombre}</div>
          )}
        </div>

        {/* FIX CRÍTICO: el select de tipo siempre usa editedData.tipo */}
        <div>
          {isEditing ? (
            <select value={editedData.tipo} onChange={(e) => setEditedData({ ...editedData, tipo: e.target.value })} style={styles.select}>
              {ANIME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : (
            <span style={styles.tag}>{anime.tipo}</span>
          )}
        </div>

        <div>
          {isEditing ? (
            // ✨ Al editar completado/abandonado, mostrar input de caps también
            <input type="number" value={editedData.capitulos_vistos} onChange={(e) => setEditedData({ ...editedData, capitulos_vistos: parseInt(e.target.value) || 0 })} style={styles.capsInput} min="0" />
          ) : isWatching ? (
            <div style={styles.capitulosControls}>
              <button onClick={() => handleUpdateCapitulos(-1)} style={styles.capitulosButton} onMouseOver={(e) => e.target.style.background = '#374151'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
                <ChevronDown size={18} />
              </button>
              <span style={styles.capitulosNumber}>{anime.capitulos_vistos}</span>
              <button onClick={() => handleUpdateCapitulos(1)} style={styles.capitulosButton} onMouseOver={(e) => e.target.style.background = '#374151'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
                <ChevronUp size={18} />
              </button>
            </div>
          ) : (
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{anime.capitulos_vistos} caps</span>
          )}
        </div>

        <div>
          {anime.estado !== 'por_ver' ? (
            <a href={`https://www.google.com/search?q=${encodeURIComponent(anime.nombre + ' anime')}`} target="_blank" rel="noopener noreferrer" style={styles.link}>🔍 Google</a>
          ) : (
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>—</span>
          )}
        </div>

        {isNotWatching && (
          <div style={styles.starContainer}>
            {isEditing && anime.estado !== 'por_ver' ? (
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setEditedData({ ...editedData, calificacion: n })} style={{ padding: '0.1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Star size={18} style={{ fill: n <= editedData.calificacion ? '#facc15' : 'none', color: n <= editedData.calificacion ? '#facc15' : '#6b7280' }} />
                  </button>
                ))}
              </div>
            ) : anime.estado === 'completado' && anime.calificacion > 0 ? (
              [1,2,3,4,5].map(n => (
                <Star key={n} size={16} style={{ fill: n <= anime.calificacion ? '#facc15' : 'none', color: n <= anime.calificacion ? '#facc15' : '#d1d5db' }} />
              ))
            ) : (
              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                {anime.estado === 'abandonado' ? 'Abandonado' : anime.estado === 'por_ver' ? 'Por ver' : 'Sin calificar'}
              </span>
            )}
          </div>
        )}

        <div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSaveEdit} style={{ ...styles.iconButton, background: '#10b981', color: 'white' }}><Save size={16} /></button>
              <button onClick={handleCancelEdit} style={{ ...styles.iconButton, background: '#ef4444', color: 'white' }}><X size={16} /></button>
            </div>
          ) : (
            <button ref={menuButtonRef} onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} style={styles.menuButton} onMouseOver={(e) => e.target.style.background = '#374151'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              <MoreVertical size={20} style={{ color: '#6b7280' }} />
            </button>
          )}
        </div>
      </div>

      {/* Menú desktop */}
      {showMenu && (
        <div ref={menuRef} style={{ ...getMenuPosition(), background: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', zIndex: 9999, minWidth: '10rem' }}>
          {/* ✨ Editar disponible en completado y abandonado también */}
          {canEdit && (
            <button onClick={() => handleMenuAction(() => setIsEditing(true))} style={menuItemStyle('#e5e7eb', true)}
              onMouseOver={(e) => e.currentTarget.style.background = '#374151'} onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
              <Edit2 size={16} /> Editar
            </button>
          )}
          {isWatching && (
            <>
              <button onClick={() => handleMenuAction(() => setShowRating(true))} style={menuItemStyle()}
                onMouseOver={(e) => e.currentTarget.style.background = '#374151'} onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
                <Check size={16} /> Finalizado
              </button>
              <button onClick={() => handleMenuAction(() => handleChangeEstado('abandonado'))} style={menuItemStyle('#f59e0b')}
                onMouseOver={(e) => e.currentTarget.style.background = '#374151'} onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
                <Trash2 size={16} /> Abandonar
              </button>
            </>
          )}
          {anime.estado === 'completado' && (
            <button onClick={() => handleMenuAction(() => handleChangeEstado('viendo', 0))} style={menuItemStyle()}
              onMouseOver={(e) => e.currentTarget.style.background = '#374151'} onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
              <PlayCircle size={16} /> Nueva Temporada
            </button>
          )}
          {anime.estado === 'abandonado' && (
            <button onClick={() => handleMenuAction(() => handleChangeEstado('viendo'))} style={menuItemStyle()}
              onMouseOver={(e) => e.currentTarget.style.background = '#374151'} onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
              <PlayCircle size={16} /> Retomar
            </button>
          )}
          {anime.estado === 'por_ver' && (
            <button onClick={() => handleMenuAction(() => handleChangeEstado('viendo'))} style={menuItemStyle('#10b981', true)}
              onMouseOver={(e) => e.currentTarget.style.background = '#374151'} onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
              <PlayCircle size={16} /> Empezar a ver
            </button>
          )}
          <button onClick={() => handleMenuAction(() => onDelete(anime.id))} style={menuItemStyle('#ef4444', false, true)}
            onMouseOver={(e) => e.currentTarget.style.background = '#374151'} onMouseOut={(e) => e.currentTarget.style.background = '#1f2937'}>
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}

      {/* Modal calificación */}
      {showRating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setShowRating(false)}>
          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '24rem', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937', textAlign: 'center' }}>Califica "{anime.nombre}"</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <Star size={32} style={{ fill: n <= rating ? '#facc15' : 'none', color: n <= rating ? '#facc15' : '#d1d5db' }} />
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowRating(false)} style={{ flex: 1, padding: '0.75rem', background: '#e5e7eb', color: '#1f2937', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleFinish} disabled={rating === 0} style={{ flex: 1, padding: '0.75rem', background: rating === 0 ? '#d1d5db' : '#9333ea', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: rating === 0 ? 'not-allowed' : 'pointer' }}>Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnimeCard;