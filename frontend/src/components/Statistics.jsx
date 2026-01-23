import React from 'react';
import { TrendingUp, Award, Star, BarChart3 } from 'lucide-react';

// ============================================
// COMPONENTE STATISTICS
// ============================================
const Statistics = ({ animes }) => {
  const totalEpisodes = animes.reduce((sum, a) => sum + (a.capitulos_vistos || 0), 0);
  const completedAnimes = animes.filter(a => a.estado === 'completado').length;
  const watchingAnimes = animes.filter(a => a.estado === 'viendo').length;
  
  const typeStats = animes.reduce((acc, anime) => {
    acc[anime.tipo] = (acc[anime.tipo] || 0) + 1;
    return acc;
  }, {});

  const topTypes = Object.entries(typeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgRating = animes
    .filter(a => a.calificacion > 0)
    .reduce((sum, a, _, arr) => sum + a.calificacion / arr.length, 0)
    .toFixed(1);

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    card: {
      background: '#1f2937',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #374151'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '0.95rem',
      fontWeight: '500',
      color: '#9ca3af'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#f9fafb',
      lineHeight: 1
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    },
    typeList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    typeItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    typeName: {
      fontSize: '0.875rem',
      color: '#e5e7eb'
    },
    typeCount: {
      background: '#374151',
      color: '#c7d2fe',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontWeight: '600'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <TrendingUp size={24} style={{ color: '#6366f1' }} />
          <span style={styles.cardTitle}>Episodios Totales</span>
        </div>
        <div style={styles.statNumber}>{totalEpisodes}</div>
        <div style={styles.statLabel}>episodios vistos</div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Award size={24} style={{ color: '#10b981' }} />
          <span style={styles.cardTitle}>Completados</span>
        </div>
        <div style={styles.statNumber}>{completedAnimes}</div>
        <div style={styles.statLabel}>de {animes.length} totales</div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Star size={24} style={{ color: '#fbbf24' }} />
          <span style={styles.cardTitle}>Rating Promedio</span>
        </div>
        <div style={styles.statNumber}>{avgRating || '0.0'}</div>
        <div style={styles.statLabel}>⭐ de 5 estrellas</div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <BarChart3 size={24} style={{ color: '#8b5cf6' }} />
          <span style={styles.cardTitle}>Top Géneros</span>
        </div>
        <div style={styles.typeList}>
          {topTypes.length > 0 ? topTypes.map(([type, count]) => (
            <div key={type} style={styles.typeItem}>
              <span style={styles.typeName}>{type}</span>
              <span style={styles.typeCount}>{count}</span>
            </div>
          )) : (
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Sin datos
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;