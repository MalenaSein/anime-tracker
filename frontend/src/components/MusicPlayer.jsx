import React, { useState, useRef, useEffect } from 'react';
import { Music2, ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';

const PLAYLIST_ID = 'PLJHTiHdYy2pemxy_JEZaILyS83E9FPOJo';

const MusicPlayer = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const playerRef = useRef(null);

  // Set default position bottom-right on mount
  useEffect(() => {
    setPos({
      x: window.innerWidth - 340,
      y: window.innerHeight - 80
    });
  }, []);

  // Drag logic
  const onMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('iframe')) return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
    e.preventDefault();
  };

  const onTouchStart = (e) => {
    if (e.target.closest('button') || e.target.closest('iframe')) return;
    setDragging(true);
    const t = e.touches[0];
    dragOffset.current = {
      x: t.clientX - pos.x,
      y: t.clientY - pos.y
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y))
      });
    };
    const onTouchMove = (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 320, t.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, t.clientY - dragOffset.current.y))
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}&autoplay=${open ? 1 : 0}&enablejsapi=1`;

  if (pos.x === null) return null;

  return (
    <>
      {/* Floating pill button when closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '2rem',
            padding: '0.6rem 1.1rem',
            color: '#a5b4fc',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 24px rgba(99,102,241,0.3)',
            transition: 'all 0.2s',
            letterSpacing: '0.03em',
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 32px rgba(99,102,241,0.5)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.3)'}
        >
          <Music2 size={16} style={{ animation: 'music-pulse 2s ease-in-out infinite' }} />
          <span>Música</span>
          <style>{`
            @keyframes music-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.15); opacity: 0.8; }
            }
          `}</style>
        </button>
      )}

      {/* Player window */}
      {open && (
        <div
          ref={playerRef}
          style={{
            position: 'fixed',
            left: pos.x,
            top: minimized ? pos.y : Math.min(pos.y, window.innerHeight - 340),
            zIndex: 9999,
            width: 320,
            background: 'linear-gradient(160deg, #0f0c29 0%, #1a1740 50%, #0f172a 100%)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: '1rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {/* Header / drag handle */}
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.75rem',
              cursor: dragging ? 'grabbing' : 'grab',
              background: 'rgba(99,102,241,0.08)',
              borderBottom: minimized ? 'none' : '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <GripVertical size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
            <Music2 size={14} style={{ color: '#a5b4fc', flexShrink: 0 }} />
            <span style={{
              flex: 1, color: '#c7d2fe', fontSize: '0.8rem', fontWeight: '600',
              letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>
              Mi Playlist
            </span>
            <button
              onClick={() => setMinimized(m => !m)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: '0.15rem', display: 'flex' }}
              title={minimized ? 'Expandir' : 'Minimizar'}
            >
              {minimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: '0.15rem', display: 'flex' }}
              title="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          {/* YouTube iframe */}
          {!minimized && (
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
              <iframe
                src={embedUrl}
                title="Playlist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%',
                  border: 'none',
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MusicPlayer;