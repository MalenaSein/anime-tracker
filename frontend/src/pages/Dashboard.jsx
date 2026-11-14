import React, { useState, useEffect, useRef } from 'react';
import { Plus, PlayCircle, Upload } from 'lucide-react';
import { animeAPI } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import AddAnimeModal from '../components/AddAnimeModal';
import ImportAnimeModal from '../components/ImportAnimeModal';
import SeasonModal from '../components/SeasonModal';
import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import Statistics from '../components/Statistics';
import ScheduleCalendar from '../components/ScheduleCalendar';
import MusicPlayer from '../components/MusicPlayer';
import { ANIME_TYPES } from '../constants/animeTypes';

const Dashboard = ({ user, onLogout, onUserUpdated }) => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('viendo');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentUser, setCurrentUser] = useState(user);
  const [filters, setFilters] = useState({ tipo: '', rating: '', sortBy: 'updated' });
  const [message, setMessage] = useState(null);
  const messageTimer = useRef(null);

  const notify = (type, text) => {
    setMessage({ type, text });
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAnimes(); }, []);

  const loadAnimes = async () => {
    try {
      const data = await animeAPI.getAll();
      if (Array.isArray(data)) setAnimes(data);
    } catch (err) {
      console.error('Error al cargar animes:', err);
      notify('error', err.message || 'No se pudieron cargar los animes');
    } finally {
      setLoading(false);
    }
  };

  const addAnime = async (formData) => {
    try {
      const data = await animeAPI.create(formData);
      setAnimes((previous) => [...previous, data]);
      setShowAddModal(false);
      notify('success', 'Anime agregado correctamente');
      return true;
    } catch (err) {
      console.error('Error al agregar anime:', err);
      notify('error', err.message || 'No se pudo agregar el anime');
      return false;
    }
  };

  const importAnimes = async (items, options = {}) => {
    const result = await animeAPI.importMany(items, options);
    await loadAnimes();
    notify(
      'success',
      `Importados: ${result.imported}${result.updated ? ` · Portadas actualizadas: ${result.updated}` : ''}${result.deleted ? ` · Eliminados: ${result.deleted}` : ''}${result.skipped ? ` · Ya existían: ${result.skipped}` : ''}${result.failed ? ` · Fallidos: ${result.failed}` : ''}`
    );
    return result;
  };

  const addNewSeason = async (id) => {
    const anime = animes.find(a => a.id === id);
    if (anime) {
      const success = await updateAnime(id, {
        capitulos_vistos: anime.capitulos_vistos,
        estado: 'viendo',
        calificacion: 0,
        nombre: anime.nombre,
        tipo: anime.tipo
      });
      if (success) setShowSeasonModal(false);
    }
  };

  const updateAnime = async (id, updatedData) => {
    try {
      const data = await animeAPI.update(id, updatedData);
      setAnimes((previous) => previous.map(a => a.id === id ? data : a));
      return true;
    } catch (err) {
      console.error('Error al actualizar anime:', err);
      notify('error', err.message || 'No se pudo actualizar el anime');
      return false;
    }
  };

  const deleteAnime = async (id) => {
    try {
      await animeAPI.delete(id);
      setAnimes((previous) => previous.filter(a => a.id !== id));
      notify('success', 'Anime eliminado');
      return true;
    } catch (err) {
      console.error('Error al eliminar anime:', err);
      notify('error', err.message || 'No se pudo eliminar el anime');
      return false;
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    if (onUserUpdated) onUserUpdated(updatedUser);
  };

  const getFilteredAnimes = () => {
    let filtered = animes.filter(a => a.estado === activeTab);

    if (filters.tipo) filtered = filtered.filter(a => a.tipo === filters.tipo);
    if (filters.rating) {
      const exactRating = parseInt(filters.rating);
      filtered = filtered.filter(a => a.calificacion === exactRating);
    }

    switch (filters.sortBy) {
      case 'name-asc': filtered.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'name-desc': filtered.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
      case 'episodes-desc': filtered.sort((a, b) => b.capitulos_vistos - a.capitulos_vistos); break;
      case 'episodes-asc': filtered.sort((a, b) => a.capitulos_vistos - b.capitulos_vistos); break;
      case 'rating-desc': filtered.sort((a, b) => b.calificacion - a.calificacion); break;
      default: break;
    }
    return filtered;
  };

  const filteredAnimes = getFilteredAnimes();

  // Tabs configuración
  const tabs = [
    { id: 'viendo', label: 'Viendo', color: '#6366f1' },
    { id: 'por_ver', label: 'Por Ver', color: '#0ea5e9' },
    { id: 'pausado', label: 'Pausados', color: '#eab308' },
    { id: 'completado', label: 'Completados', color: '#10b981' },
    { id: 'abandonado', label: 'Abandonados', color: '#f59e0b' },
  ];

  const styles = {
    container: { minHeight: '100vh', background: '#0f172a' },
    content: { maxWidth: '80rem', margin: '0 auto', padding: isMobile ? '1rem' : '2rem' },
    loadingContainer: { minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '600', color: '#6366f1' },
    tabContainer: {
      display: 'flex', gap: isMobile ? '0.5rem' : '0.75rem', marginBottom: '1.5rem',
      flexWrap: 'wrap', borderBottom: '1px solid #374151', paddingBottom: '0.5rem',
      overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch'
    },
    tab: {
      padding: isMobile ? '0.5rem 0.75rem' : '0.625rem 1.25rem',
      borderRadius: '0.5rem', fontWeight: '500', border: 'none',
      cursor: 'pointer', transition: 'all 0.2s',
      fontSize: isMobile ? '0.8rem' : '0.9rem', whiteSpace: 'nowrap', flexShrink: 0
    },
    tableContainer: {
      background: '#1f2937', borderRadius: '0.75rem',
      border: '1px solid #374151', overflow: isMobile ? 'visible' : 'hidden'
    },
    tableHeader: {
      display: isMobile ? 'none' : 'grid',
      gridTemplateColumns: activeTab === 'viendo'
        ? '80px 1fr 150px 150px 120px 100px'
        : '80px 1fr 150px 150px 120px 140px 100px',
      gap: '1rem', padding: '1rem', background: '#111827',
      borderBottom: '1px solid #374151', fontWeight: '500', color: '#9ca3af', fontSize: '0.875rem'
    },
    emptyState: {
      textAlign: 'center', padding: isMobile ? '2rem 1rem' : '3rem',
      color: '#6b7280', fontSize: isMobile ? '0.9rem' : '1rem'
    },
    actionButton: {
      padding: isMobile ? '0.875rem' : '0.75rem 1.25rem', borderRadius: '0.5rem',
      border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '0.5rem', fontWeight: '500',
      fontSize: isMobile ? '0.95rem' : '0.9rem', transition: 'all 0.2s'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Cargando...</div>
      </div>
    );
  }

  const isListTab = !showStatistics && !showSchedule;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Navbar user={currentUser} onLogout={onLogout} onUserUpdated={handleUserUpdated} />

        {message && (
          <div
            role="status"
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              background: message.type === 'error' ? '#7f1d1d' : '#064e3b',
              border: `1px solid ${message.type === 'error' ? '#991b1b' : '#065f46'}`,
              color: message.type === 'error' ? '#fca5a5' : '#6ee7b7'
            }}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowStatistics(false); setShowSchedule(false); }}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id && isListTab
                  ? { background: tab.color, color: 'white' }
                  : { background: 'transparent', color: '#9ca3af' })
              }}
              onMouseOver={(e) => { if (activeTab !== tab.id || !isListTab) e.target.style.color = '#e5e7eb'; }}
              onMouseOut={(e) => { if (activeTab !== tab.id || !isListTab) e.target.style.color = '#9ca3af'; }}
            >
              {tab.label} ({animes.filter(a => a.estado === tab.id).length})
            </button>
          ))}

          <button
            onClick={() => { setShowStatistics(true); setShowSchedule(false); }}
            style={{
              ...styles.tab,
              ...(showStatistics && !showSchedule
                ? { background: '#8b5cf6', color: 'white' }
                : { background: 'transparent', color: '#9ca3af' })
            }}
            onMouseOver={(e) => { if (!showStatistics || showSchedule) e.target.style.color = '#e5e7eb'; }}
            onMouseOut={(e) => { if (!showStatistics || showSchedule) e.target.style.color = '#9ca3af'; }}
          >
            Estadísticas
          </button>

          <button
            onClick={() => { setShowSchedule(true); setShowStatistics(false); setActiveTab(''); }}
            style={{
              ...styles.tab,
              ...(showSchedule ? { background: '#ec4899', color: 'white' } : { background: 'transparent', color: '#9ca3af' })
            }}
            onMouseOver={(e) => { if (!showSchedule) e.target.style.color = '#e5e7eb'; }}
            onMouseOut={(e) => { if (!showSchedule) e.target.style.color = '#9ca3af'; }}
          >
            Calendario
          </button>
        </div>

        {/* Contenido */}
        {showSchedule ? (
          <ScheduleCalendar animes={animes} />
        ) : showStatistics ? (
          <Statistics animes={animes} />
        ) : (
          <>
            <Filters filters={filters} setFilters={setFilters} animeTypes={ANIME_TYPES} />

            {/* Botones de acción */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => setShowAddModal(true)}
                style={{ ...styles.actionButton, background: '#6366f1', borderColor: '#6366f1', color: 'white' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4f46e5'}
                onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
              >
                <Plus size={20} />
                {activeTab === 'por_ver' ? 'Agregar a Por Ver' : 'Nuevo Anime'}
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                style={{ ...styles.actionButton, background: 'transparent', borderColor: '#10b981', color: '#10b981' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
              >
                <Upload size={20} /> Importar lista
              </button>

              {activeTab === 'viendo' && (
                <button
                  onClick={() => setShowSeasonModal(true)}
                  style={{ ...styles.actionButton, background: 'transparent', borderColor: '#6366f1', color: '#6366f1' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6366f1'; }}
                >
                  <PlayCircle size={20} /> Nueva Temporada
                </button>
              )}
            </div>

            <div style={styles.tableContainer}>
              {!isMobile && (
                <div style={styles.tableHeader}>
                  <div>Portada</div>
                  <div>Nombre</div>
                  <div>Tipo</div>
                  <div>{activeTab === 'viendo' ? 'Capítulos' : 'Caps vistos'}</div>
                  <div>Búsqueda</div>
                  {activeTab !== 'viendo' && activeTab !== 'por_ver' && <div>Calificación</div>}
                  {activeTab === 'por_ver' && <div>Estado</div>}
                  <div>Acciones</div>
                </div>
              )}

              {filteredAnimes.length === 0 ? (
                <div style={styles.emptyState}>
                  {activeTab === 'viendo' && '🎬 No hay animes en esta categoría'}
                  {activeTab === 'por_ver' && '📋 No hay animes en "Por Ver". ¡Agregá algunos!'}
                  {activeTab === 'pausado' && '⏸️ No hay animes pausados'}
                  {activeTab === 'completado' && '✅ No hay animes completados con estos filtros'}
                  {activeTab === 'abandonado' && '🚫 No hay animes abandonados con estos filtros'}
                </div>
              ) : isMobile ? (
                <div>
                  {filteredAnimes.map(anime => (
                    <AnimeCard
                      key={anime.id} anime={anime}
                      isWatching={activeTab === 'viendo'}
                      onUpdate={updateAnime} onDelete={deleteAnime} isMobile={true}
                    />
                  ))}
                </div>
              ) : (
                filteredAnimes.map(anime => (
                  <AnimeCard
                    key={anime.id} anime={anime}
                    isWatching={activeTab === 'viendo'}
                    onUpdate={updateAnime} onDelete={deleteAnime} isMobile={false}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* Modales */}
        <AddAnimeModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(formData) => addAnime({ ...formData, estado: activeTab === 'por_ver' ? 'por_ver' : 'viendo' })}
        />

        <ImportAnimeModal
          show={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={importAnimes}
        />

        <SeasonModal
          show={showSeasonModal}
          onClose={() => setShowSeasonModal(false)}
          animes={animes}
          onSelect={addNewSeason}
        />
      </div>
      <MusicPlayer />
    </div>
  );
};

export default Dashboard;