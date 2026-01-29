import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const ScheduleCalendar = ({ animes, onUpdateSchedule }) => {
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedDay, setSelectedDay] = useState(0);
  const [formData, setFormData] = useState({
    animeId: '',
    day: '',
    hour: '',
    minute: '0'
  });

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = ['00', '15', '30', '45'];

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const navigateDay = (direction) => {
    setSelectedDay((prev) => {
      const newDay = prev + direction;
      if (newDay < 0) return 6;
      if (newDay > 6) return 0;
      return newDay;
    });
  };

  const styles = {
    container: {
      background: '#1f2937',
      borderRadius: isMobile ? '0.5rem' : '1rem',
      padding: isMobile ? '1rem' : '2rem',
      border: '1px solid #374151',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
    },
    header: {
      marginBottom: isMobile ? '1.5rem' : '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#f9fafb',
      flexWrap: 'wrap'
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      fontWeight: '700',
      margin: 0,
      color: '#f9fafb'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      marginTop: '0.5rem'
    },
    // VERSIÓN MÓVIL - DÍA POR DÍA
    mobileContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    daySelector: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#111827',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid #374151'
    },
    navButton: {
      background: '#374151',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      color: '#e5e7eb',
      transition: 'background-color 0.2s'
    },
    dayTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#f9fafb'
    },
    hoursList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    hourCard: {
      background: '#111827',
      borderRadius: '0.5rem',
      border: '1px solid #374151',
      padding: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    hourCardEmpty: {
      borderStyle: 'dashed',
      borderColor: '#4b5563'
    },
    hourHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    hourLabel: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    addButtonMobile: {
      background: '#6366f1',
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      padding: '0.375rem 0.75rem',
      fontSize: '0.8rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'background-color 0.2s'
    },
    schedulesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    // VERSIÓN DESKTOP
    calendarWrapper: {
      background: '#111827',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      border: '1px solid #374151',
      overflowX: 'auto'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(7, 1fr)',
      fontSize: '0.85rem',
      minWidth: '900px'
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
    hourLabelDesktop: {
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
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    // MODAL
    modal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: isMobile ? '1rem' : '0'
    },
    modalContent: {
      background: 'white',
      borderRadius: '0.75rem',
      padding: isMobile ? '1.25rem' : '2rem',
      maxWidth: isMobile ? '100%' : '28rem',
      width: '100%',
      maxHeight: isMobile ? '90vh' : 'auto',
      overflowY: 'auto'
    },
    modalHeader: {
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },
    modalSubtitle: {
      color: '#6b7280',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    notificationBadge: {
      background: '#dbeafe',
      color: '#1e40af',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginTop: '0.25rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    select: {
      width: '100%',
      padding: isMobile ? '0.625rem' : '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '0.9rem' : '1rem',
      transition: 'all 0.2s',
      background: 'white',
      color: '#1f2937'
    },
    selectFocus: {
      borderColor: '#6366f1',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '2rem',
      flexDirection: isMobile ? 'column' : 'row'
    },
    button: {
      flex: 1,
      padding: isMobile ? '0.875rem' : '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '0.95rem' : '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    primaryButton: {
      background: '#6366f1',
      color: 'white'
    },
    primaryButtonHover: {
      background: '#4f46e5',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    },
    secondaryButton: {
      background: '#e5e7eb',
      color: '#1f2937'
    },
    secondaryButtonHover: {
      background: '#d1d5db'
    },
    hint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '1rem',
      textAlign: 'center'
    }
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

  // COMPONENTE MÓVIL
  const MobileCalendar = () => {
    return (
      <div style={styles.mobileContainer}>
        <div style={styles.daySelector}>
          <button
            onClick={() => navigateDay(-1)}
            style={styles.navButton}
            onMouseOver={(e) => e.target.style.background = '#4b5563'}
            onMouseOut={(e) => e.target.style.background = '#374151'}
          >
            <ChevronLeft size={24} />
          </button>
          <div style={styles.dayTitle}>{days[selectedDay]}</div>
          <button
            onClick={() => navigateDay(1)}
            style={styles.navButton}
            onMouseOver={(e) => e.target.style.background = '#4b5563'}
            onMouseOut={(e) => e.target.style.background = '#374151'}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div style={styles.hoursList}>
          {hours.map(hour => {
            const cellSchedules = getSchedulesForCell(selectedDay, hour);
            const hasSchedules = cellSchedules.length > 0;

            return (
              <div
                key={hour}
                style={{
                  ...styles.hourCard,
                  ...(hasSchedules ? {} : styles.hourCardEmpty)
                }}
                onClick={() => openAddModal(selectedDay, hour)}
              >
                <div style={styles.hourHeader}>
                  <div style={styles.hourLabel}>
                    <Clock size={16} />
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {!hasSchedules && (
                    <button
                      style={styles.addButtonMobile}
                      onMouseOver={(e) => e.target.style.background = '#4f46e5'}
                      onMouseOut={(e) => e.target.style.background = '#6366f1'}
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddModal(selectedDay, hour);
                      }}
                    >
                      <Plus size={14} /> Agregar
                    </button>
                  )}
                </div>

                {hasSchedules && (
                  <div style={styles.schedulesList}>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // COMPONENTE DESKTOP
  const DesktopCalendar = () => {
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

    return (
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
              <div style={styles.hourLabelDesktop}>
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

          {!isMobile && (
            <p style={styles.hint}>
              💡 Presiona <strong>Enter</strong> para agregar o <strong>Esc</strong> para cancelar
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Clock size={isMobile ? 32 : 40} color="#6366f1" />
        <div style={{ flex: 1 }}>
          <h1 style={styles.title}>Calendario de Emisión</h1>
          <p style={styles.subtitle}>
            {isMobile 
              ? 'Horarios y notificaciones por email'
              : 'Configura los horarios de tus animes favoritos y recibe notificaciones por email'
            }
          </p>
        </div>
      </div>

      {isMobile ? <MobileCalendar /> : <DesktopCalendar />}

      <Modal />
    </div>
  );
};

export default ScheduleCalendar;