import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, Clock, Calendar as CalendarIcon } from 'lucide-react';

const ScheduleCalendar = ({ animes, onUpdateSchedule }) => {
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formData, setFormData] = useState({
    animeId: '',
    day: '',
    hour: '',
    minute: '0'
  });

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = ['00', '15', '30', '45'];

  // Efecto para manejar la tecla Enter en el modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && showAddModal && formData.animeId && selectedCell !== null) {
        e.preventDefault();
        handleAddSchedule();
      } else if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
        setSelectedCell(null);
        setFormData({ animeId: '', day: '', hour: '', minute: '0' });
      }
    };

    if (showAddModal) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddModal, formData, selectedCell]);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/schedules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!data.error) {
        setSchedules(data);
      }
    } catch (err) {
      console.error('Error al cargar horarios:', err);
    }
  };

  const handleAddSchedule = async () => {
    if (!formData.animeId || selectedCell === null) return;

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const scheduleData = {
        anime_id: formData.animeId,
        day: selectedCell.day,
        hour: selectedCell.hour,
        minute: parseInt(formData.minute),
        notification_enabled: true
      };

      const res = await fetch(`${API_URL}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });
      const data = await res.json();
      
      if (!data.error) {
        setSchedules([...schedules, data]);
        setShowAddModal(false);
        setSelectedCell(null);
        setFormData({ animeId: '', day: '', hour: '', minute: '0' });
      }
    } catch (err) {
      console.error('Error al agregar horario:', err);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    } catch (err) {
      console.error('Error al eliminar horario:', err);
    }
  };

  const getSchedulesForCell = (dayIndex, hour) => {
    return schedules.filter(s => s.day === dayIndex && s.hour === hour);
  };

  const openAddModal = (dayIndex, hour) => {
    setSelectedCell({ day: dayIndex, hour });
    setFormData({ ...formData, minute: '0' });
    setShowAddModal(true);
  };

  const styles = {
    container: {
      background: '#1f2937',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid #374151',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
    },
    header: {
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#f9fafb'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      margin: 0,
      color: '#f9fafb'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: '0.95rem',
      marginTop: '0.5rem'
    },
    calendarWrapper: {
      background: '#111827',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      border: '1px solid #374151'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(7, 1fr)',
      fontSize: '0.85rem'
    },
    headerCell: {
      padding: '1rem 0.5rem',
      textAlign: 'center',
      fontWeight: '700',
      background: '#6366f1',
      color: 'white',
      fontSize: '0.9rem',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
    },
    hourLabel: {
      padding: '0.75rem',
      textAlign: 'center',
      fontWeight: '600',
      background: '#1f2937',
      color: '#9ca3af',
      borderBottom: '1px solid #374151',
      fontSize: '0.85rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem'
    },
    cell: {
      minHeight: '70px',
      padding: '0.5rem',
      borderBottom: '1px solid #374151',
      borderRight: '1px solid #374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      background: '#111827'
    },
    cellHover: {
      background: '#1f2937',
      transform: 'scale(1.02)',
      zIndex: 1,
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
    },
    scheduleItem: {
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: 'white',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.75rem',
      marginBottom: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.25rem',
      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    scheduleItemHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.5)'
    },
    scheduleTime: {
      fontSize: '0.7rem',
      opacity: 0.9,
      marginTop: '0.15rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    animeName: {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '0.8rem'
    },
    deleteButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '0.25rem',
      padding: '0.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      color: 'white'
    },
    deleteButtonHover: {
      background: 'rgba(239, 68, 68, 0.9)',
      transform: 'scale(1.1)'
    },
    addButton: {
      background: 'rgba(99, 102, 241, 0.1)',
      border: '2px dashed #6366f1',
      color: '#6366f1',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      width: '100%',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    addButtonHover: {
      background: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#8b5cf6',
      color: '#8b5cf6',
      transform: 'scale(1.05)'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      background: '#1f2937',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '32rem',
      width: '90%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      border: '1px solid #374151'
    },
    modalHeader: {
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#f9fafb',
      marginBottom: '0.5rem'
    },
    modalSubtitle: {
      color: '#9ca3af',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#e5e7eb',
      marginBottom: '0.5rem'
    },
    select: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      border: '1px solid #374151',
      borderRadius: '0.5rem',
      background: '#111827',
      color: '#f9fafb',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    selectFocus: {
      borderColor: '#6366f1',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '2rem'
    },
    button: {
      flex: 1,
      padding: '0.875rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    primaryButton: {
      background: '#6366f1',
      color: 'white',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    },
    primaryButtonHover: {
      background: '#4f46e5',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)'
    },
    secondaryButton: {
      background: '#374151',
      color: '#e5e7eb'
    },
    secondaryButtonHover: {
      background: '#4b5563'
    },
    notificationBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      background: 'rgba(16, 185, 129, 0.2)',
      color: '#10b981',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    hint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '1rem',
      textAlign: 'center'
    }
  };

  const CellContent = ({ dayIndex, hour }) => {
    const [isHovered, setIsHovered] = useState(false);
    const cellSchedules = getSchedulesForCell(dayIndex, hour);

    return (
      <div
        style={{
          ...styles.cell,
          ...(isHovered ? styles.cellHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => openAddModal(dayIndex, hour)}
      >
        {cellSchedules.map((schedule) => {
          const anime = animes.find(a => a.id === schedule.anime_id);
          return (
            <ScheduleItemComponent
              key={schedule.id}
              schedule={schedule}
              anime={anime}
              onDelete={handleDeleteSchedule}
            />
          );
        })}
        
        {isHovered && cellSchedules.length === 0 && (
          <button style={styles.addButton}>
            <Plus size={14} />
            Agregar
          </button>
        )}
      </div>
    );
  };

  const ScheduleItemComponent = ({ schedule, anime, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleteHovered, setIsDeleteHovered] = useState(false);

    const timeStr = `${schedule.hour.toString().padStart(2, '0')}:${(schedule.minute || 0).toString().padStart(2, '0')}`;

    return (
      <div
        style={{
          ...styles.scheduleItem,
          ...(isHovered ? styles.scheduleItemHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={styles.animeName} title={anime?.nombre}>
            {anime?.nombre || 'Anime Desconocido'}
          </div>
          <div style={styles.scheduleTime}>
            <Clock size={10} />
            {timeStr}
          </div>
        </div>
        {schedule.notification_enabled && (
          <Bell size={12} style={{ flexShrink: 0 }} />
        )}
        <button
          style={{
            ...styles.deleteButton,
            ...(isDeleteHovered ? styles.deleteButtonHover : {})
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(schedule.id);
          }}
          onMouseEnter={() => setIsDeleteHovered(true)}
          onMouseLeave={() => setIsDeleteHovered(false)}
        >
          <X size={12} />
        </button>
      </div>
    );
  };

  const Modal = () => {
    const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
    const [isSecondaryHovered, setIsSecondaryHovered] = useState(false);
    const [isSelectFocused, setIsSelectFocused] = useState(false);
    const [isMinuteFocused, setIsMinuteFocused] = useState(false);

    if (!showAddModal) return null;

    const selectedDayName = selectedCell ? days[selectedCell.day] : '';
    const selectedHourFormatted = selectedCell ? `${selectedCell.hour}:${formData.minute || '00'}` : '';

    return (
      <div style={styles.modal} onClick={() => {
        setShowAddModal(false);
        setSelectedCell(null);
        setFormData({ animeId: '', day: '', hour: '', minute: '0' });
      }}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>Agregar Horario</h2>
            <p style={styles.modalSubtitle}>
              {selectedDayName} a las {selectedHourFormatted}
              <span style={styles.notificationBadge}>
                <Bell size={12} />
                Notificación activada
              </span>
            </p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <CalendarIcon size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Selecciona el Anime
            </label>
            <select
              value={formData.animeId}
              onChange={(e) => setFormData({ ...formData, animeId: e.target.value })}
              style={{
                ...styles.select,
                ...(isSelectFocused ? styles.selectFocus : {})
              }}
              onFocus={() => setIsSelectFocused(true)}
              onBlur={() => setIsSelectFocused(false)}
              autoFocus
            >
              <option value="">-- Selecciona un anime --</option>
              {animes
                .filter(a => a.estado === 'viendo')
                .map(anime => (
                  <option key={anime.id} value={anime.id}>
                    {anime.nombre}
                  </option>
                ))
              }
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Minutos
            </label>
            <select
              value={formData.minute}
              onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
              style={{
                ...styles.select,
                ...(isMinuteFocused ? styles.selectFocus : {})
              }}
              onFocus={() => setIsMinuteFocused(true)}
              onBlur={() => setIsMinuteFocused(false)}
            >
              {minutes.map(min => (
                <option key={min} value={min}>:{min}</option>
              ))}
            </select>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={handleAddSchedule}
              disabled={!formData.animeId}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                ...(isPrimaryHovered && formData.animeId ? styles.primaryButtonHover : {}),
                ...((!formData.animeId) ? { opacity: 0.5, cursor: 'not-allowed' } : {})
              }}
              onMouseEnter={() => setIsPrimaryHovered(true)}
              onMouseLeave={() => setIsPrimaryHovered(false)}
            >
              Agregar
            </button>
            <button
              onClick={() => {
                setShowAddModal(false);
                setSelectedCell(null);
                setFormData({ animeId: '', day: '', hour: '', minute: '0' });
              }}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                ...(isSecondaryHovered ? styles.secondaryButtonHover : {})
              }}
              onMouseEnter={() => setIsSecondaryHovered(true)}
              onMouseLeave={() => setIsSecondaryHovered(false)}
            >
              Cancelar
            </button>
          </div>

          <p style={styles.hint}>
            💡 Presiona <strong>Enter</strong> para agregar o <strong>Esc</strong> para cancelar
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Clock size={40} color="#6366f1" />
        <div>
          <h1 style={styles.title}>Calendario de Emisión</h1>
          <p style={styles.subtitle}>
            Configura los horarios de tus animes favoritos y recibe notificaciones por email
          </p>
        </div>
      </div>

      <div style={styles.calendarWrapper}>
        <div style={styles.calendarGrid}>
          <div style={styles.headerCell}>Hora</div>
          {days.map((day, index) => (
            <div key={index} style={styles.headerCell}>
              {day}
            </div>
          ))}

          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div style={styles.hourLabel}>
                <Clock size={14} />
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((_, dayIndex) => (
                <CellContent key={`${dayIndex}-${hour}`} dayIndex={dayIndex} hour={hour} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Modal />
    </div>
  );
};

export default ScheduleCalendar;