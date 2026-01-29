import React, { useState, useEffect } from 'react';
import { Plus, PlayCircle } from 'lucide-react';
import { animeAPI } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import AddAnimeModal from '../components/AddAnimeModal';
import SeasonModal from '../components/SeasonModal';
import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import Statistics from '../components/Statistics';
import ScheduleCalendar from '../components/ScheduleCalendar';

const Dashboard = ({ user, onLogout }) => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('viendo');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    rating: '',
    sortBy: 'updated'
  });

  // Cargar animes del backend
  useEffect(() => {
    loadAnimes();
  }, []);

  const ANIME_TYPES = [
    'Shonen', 'Shojo', 'Seinen', 'Josei', 'Kodomomuke',
    'Isekai', 'Mecha', 'Slice of Life', 'Romance', 'Comedia',
    'Drama', 'Acción', 'Aventura', 'Fantasía', 'Sci-Fi',
    'Horror', 'Misterio', 'Deportes', 'Musical', 'Ecchi',
    'Harem', 'Yaoi', 'Yuri', 'Supernatural', 'Otro'
  ];

  // Cargar animes desde la API
  const loadAnimes = async () => {
    try {
      // Esta función debe estar en tu api.js
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/animes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!data.error) {
        setAnimes(data);
      }
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
        estado: 'viendo', 
        calificacion: 0,
        nombre: anime.nombre
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Filtrar y ordenar animes
  const getFilteredAnimes = () => {
    let filtered = animes.filter(a => a.estado === activeTab);

    // Aplicar filtro de tipo
    if (filters.tipo) {
      filtered = filtered.filter(a => a.tipo === filters.tipo);
    }

    // Aplicar filtro de calificación (exacta, no "o más")
    if (filters.rating) {
      const exactRating = parseInt(filters.rating);
      filtered = filtered.filter(a => a.calificacion === exactRating);
    }

    // Aplicar ordenamiento
    switch (filters.sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'episodes-desc':
        filtered.sort((a, b) => b.capitulos_vistos - a.capitulos_vistos);
        break;
      case 'episodes-asc':
        filtered.sort((a, b) => a.capitulos_vistos - b.capitulos_vistos);
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.calificacion - a.calificacion);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredAnimes = getFilteredAnimes();

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0f172a'
    },
    content: {
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '2rem'
    },
    loadingContainer: {
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingText: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#6366f1'
    },
    tabContainer: {
      display: 'flex',
      gap: '0.75rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      borderBottom: '1px solid #374151',
      paddingBottom: '0.5rem'
    },
    tab: {
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.9rem'
    },
    activeTab: {
      color: 'white'
    },
    inactiveTab: {
      background: 'transparent',
      color: '#9ca3af'
    },
    actionButtonsContainer: {
      marginBottom: '1.5rem',
      display: 'flex',
      gap: '0.75rem'
    },
    actionButton: {
      padding: '0.75rem 1.25rem',
      borderRadius: '0.5rem',
      border: '1px solid',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'all 0.2s'
    },
    tableContainer: {
      background: '#1f2937',
      borderRadius: '0.75rem',
      border: '1px solid #374151',
      overflow: 'hidden'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: activeTab === 'viendo'
        ? '80px 1fr 150px 150px 120px 100px'
        : '80px 1fr 150px 150px 120px 140px 100px',
      gap: '1rem',
      padding: '1rem',
      background: '#111827',
      borderBottom: '1px solid #374151',
      fontWeight: '500',
      color: '#9ca3af',
      fontSize: '0.875rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#6b7280'
    }
  };

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Navbar user={user} onLogout={onLogout} />

        {/* Tabs */}
        <div style={styles.tabContainer}>
          <button
            onClick={() => { setActiveTab('viendo'); setShowStatistics(false); setShowSchedule(false); }}
            style={{
              ...styles.tab,
              ...(activeTab === 'viendo' && !showStatistics && !showSchedule
                ? { ...styles.activeTab, background: '#6366f1' }
                : styles.inactiveTab)
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'viendo' || showStatistics || showSchedule) e.target.style.color = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'viendo' || showStatistics || showSchedule) e.target.style.color = '#9ca3af';
            }}
          >
            Viendo ({animes.filter(a => a.estado === 'viendo').length})
          </button>
          <button
            onClick={() => { setActiveTab('completado'); setShowStatistics(false); setShowSchedule(false); }}
            style={{
              ...styles.tab,
              ...(activeTab === 'completado' && !showStatistics && !showSchedule
                ? { ...styles.activeTab, background: '#10b981' }
                : styles.inactiveTab)
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'completado' || showStatistics || showSchedule) e.target.style.color = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'completado' || showStatistics || showSchedule) e.target.style.color = '#9ca3af';
            }}
          >
            Completados ({animes.filter(a => a.estado === 'completado').length})
          </button>
          <button
            onClick={() => { setActiveTab('abandonado'); setShowStatistics(false); setShowSchedule(false); }}
            style={{
              ...styles.tab,
              ...(activeTab === 'abandonado' && !showStatistics && !showSchedule
                ? { ...styles.activeTab, background: '#f59e0b' }
                : styles.inactiveTab)
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'abandonado' || showStatistics || showSchedule) e.target.style.color = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'abandonado' || showStatistics || showSchedule) e.target.style.color = '#9ca3af';
            }}
          >
            Abandonados ({animes.filter(a => a.estado === 'abandonado').length})
          </button>
          <button
            onClick={() => {
              setShowStatistics(true);
              setShowSchedule(false);
            }}
            style={{
              ...styles.tab,
              ...(showStatistics && !showSchedule
                ? { ...styles.activeTab, background: '#8b5cf6' }
                : styles.inactiveTab)
            }}
            onMouseOver={(e) => {
              if (!showStatistics || showSchedule) e.target.style.color = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              if (!showStatistics || showSchedule) e.target.style.color = '#9ca3af';
            }}
          >
            Estadísticas
          </button>
          <button
            onClick={() => {
              setShowSchedule(true);
              setShowStatistics(false);
              setActiveTab('');
            }}
            style={{
              ...styles.tab,
              ...(showSchedule
                ? { ...styles.activeTab, background: '#ec4899' }
                : styles.inactiveTab)
            }}
            onMouseOver={(e) => {
              if (!showSchedule) e.target.style.color = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              if (!showSchedule) e.target.style.color = '#9ca3af';
            }}
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
            <Filters 
              filters={filters} 
              setFilters={setFilters} 
              animeTypes={ANIME_TYPES}
            />

            {/* Botones de acción - Solo en pestaña "Viendo" */}
            {activeTab === 'viendo' && (
              <div style={styles.actionButtonsContainer}>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{ ...styles.actionButton, background: '#6366f1', borderColor: '#6366f1', color: 'white' }}
                  onMouseOver={(e) => e.target.style.background = '#4f46e5'}
                  onMouseOut={(e) => e.target.style.background = '#6366f1'}
                >
                  <Plus size={20} /> Nuevo Anime
                </button>
                <button
                  onClick={() => setShowSeasonModal(true)}
                  style={{ ...styles.actionButton, background: 'transparent', borderColor: '#6366f1', color: '#6366f1' }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#6366f1';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#6366f1';
                  }}
                >
                  <PlayCircle size={20} /> Nueva Temporada
                </button>
              </div>
            )}

            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <div>Portada</div>
                <div>Nombre</div>
                <div>Tipo</div>
                <div>Capítulos</div>
                <div>Búsqueda</div>
                {activeTab !== 'viendo' && <div>Calificación</div>}
                <div>Acciones</div>
              </div>

              {filteredAnimes.length === 0 ? (
                <div style={styles.emptyState}>
                  {activeTab === 'viendo' && 'No hay animes en esta categoría'}
                  {activeTab === 'completado' && 'No hay animes completados con estos filtros'}
                  {activeTab === 'abandonado' && 'No hay animes abandonados con estos filtros'}
                </div>
              ) : (
                filteredAnimes.map(anime => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    isWatching={activeTab === 'viendo'}
                    onUpdate={updateAnime}
                    onDelete={deleteAnime}
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
          onAdd={addAnime}
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