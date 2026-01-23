import React, { useState } from 'react';
import { Filter } from 'lucide-react';

// ============================================
// COMPONENTE FILTERS
// ============================================
const Filters = ({ filters, setFilters, animeTypes }) => {
  const [showFilters, setShowFilters] = useState(false);

  const styles = {
    container: {
      background: '#1f2937',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid #374151'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: showFilters ? '1rem' : '0'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      color: '#e5e7eb',
      fontSize: '0.95rem'
    },
    toggleButton: {
      background: '#374151',
      border: 'none',
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#e5e7eb',
      transition: 'background-color 0.2s'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#9ca3af'
    },
    select: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #374151',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      background: '#111827',
      color: '#e5e7eb'
    },
    clearButton: {
      background: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Filter size={20} />
          Filtros
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={styles.toggleButton}
          onMouseOver={(e) => e.target.style.background = '#4b5563'}
          onMouseOut={(e) => e.target.style.background = '#374151'}
        >
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {showFilters && (
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Tipo</label>
            <select
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              style={styles.select}
            >
              <option value="">Todos</option>
              {animeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Calificación</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              style={styles.select}
            >
              <option value="">Todas</option>
              <option value="5">⭐ 5 estrellas</option>
              <option value="4">⭐ 4 estrellas</option>
              <option value="3">⭐ 3 estrellas</option>
              <option value="2">⭐ 2 estrellas</option>
              <option value="1">⭐ 1 estrella</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Ordenar</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              style={styles.select}
            >
              <option value="updated">Reciente</option>
              <option value="name-asc">A → Z</option>
              <option value="name-desc">Z → A</option>
              <option value="episodes-desc">Más episodios</option>
              <option value="episodes-asc">Menos episodios</option>
              <option value="rating-desc">Mayor rating</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => setFilters({ tipo: '', rating: '', sortBy: 'updated' })}
              style={styles.clearButton}
              onMouseOver={(e) => e.target.style.background = '#b91c1c'}
              onMouseOut={(e) => e.target.style.background = '#dc2626'}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;