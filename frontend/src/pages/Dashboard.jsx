import React, { useState, useEffect } from 'react';
import { Plus, PlayCircle, Clock } from 'lucide-react';
import { animeAPI } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import AddAnimeModal from '../components/AddAnimeModal';
import SeasonModal from '../components/SeasonModal';
import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import Statistics from '../components/Statistics';
import ScheduleCalendar from '../components/ScheduleCalendar';

const Dashboard = ({ user, onLogout, onUserUpdated }) => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('viendo');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentUser, setCurrentUser] = useState(user);
  const [filters, setFilters] = useState({ tipo: '', rating: '', sortBy: 'updated' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { loadAnimes(); }, []);

  const ANIME_TYPES = [
    'Shonen', 'Shojo', 'Seinen', 'Josei', 'Kodomomuke',
    'Isekai', 'Mecha', 'Slice of Life', 'Romance', 'Comedia',
    'Drama', 'Acción', 'Aventura', 'Fantasía', 'Sci-Fi',
    'Horror', 'Misterio', 'Deportes', 'Musical', 'Ecchi',
    'Harem', 'Yaoi', 'Yuri', 'Supernatural', 'Otro'
  ];

  const loadAnimes = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/animes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.error) setAnimes(data);
    } catch (err) {
      console.error('Error al cargar animes:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAnime = async (formData) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/animes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.error) {
        setAnimes([...animes, data]);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Error al agregar anime:', err);
    }
  };

  const addNewSeason = async (id) => {
    const anime = animes.find(a => a.id === id);
    if (anime) {
      await updateAnime(id, {
        capitulos_vistos: anime.capitulos_vistos,
        estado: 'viendo', calificacion: 0,
        nombre: anime.nombre, tipo: anime.tipo
      });
      setShowSeasonModal(false);
    }
  };

  const updateAnime = async (id, updatedData) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/animes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (!data.error) {
        setAnimes(animes.map(a => a.id === id ? data : a));
      }
    } catch (err) {
      console.error('Error al actualizar anime:', err);
    }
  };

  const deleteAnime = async (id) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/animes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAnimes(animes.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error al eliminar anime:', err);
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
    { id: 'por_ver', label: 'Por Ver', color: '#0ea5e9' },  // ✨ NUEVO
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
                  {activeTab === 'completado' && '✅ No hay animes completados con estos filtros'}
                  {activeTab === 'abandonado' && '🚫 No hay animes abandonados con estos filtros'}
                </div>
              ) : isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
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
          defaultEstado={activeTab === 'por_ver' ? 'por_ver' : 'viendo'}
        />

        <SeasonModal
          show={showSeasonModal}
          onClose={() => setShowSeasonModal(false)}
          animes={animes}
          onSelect={addNewSeason}
        />
      </div>
    </div>
  );
};

export default Dashboard;