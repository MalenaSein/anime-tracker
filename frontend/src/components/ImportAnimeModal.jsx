import React, { useState } from 'react';
import { Upload, X, FileJson } from 'lucide-react';

function parseList(raw) {
  const text = raw.trim();
  if (!text) throw new Error('Pegá una lista o seleccioná un archivo JSON');

  if (text.startsWith('[') || text.startsWith('{')) {
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed) ? parsed : parsed.animes;
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('El JSON debe ser un array o tener la propiedad "animes"');
    }
    return list;
  }

  const list = text.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
    const columns = line.split('\t').map((column) => column.trim());
    if (columns.length < 4) {
      throw new Error('Cada línea debe tener: nombre, tipo, estado, rating y capítulos separados por tabs');
    }

    if (/^\d+$/.test(columns[0])) columns.shift();

    const [nombre, tipo, estado, rating, capitulos] = columns;
    const stars = (rating || '').split('⭐').length - 1;

    return {
      nombre,
      tipo,
      estado,
      calificacion: stars > 0 ? stars : null,
      capitulos_vistos: capitulos ? Number(capitulos) : 0
    };
  });

  if (list.length === 0) throw new Error('No se encontraron animes en la lista');
  return list;
}

const ImportAnimeModal = ({ show, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  if (!show) return null;

  const reset = () => {
    setText('');
    setFileName('');
    setError('');
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setText(content);
      setFileName(file.name);
      setError('');
      setResult(null);
    } catch (err) {
      setError('No se pudo leer el archivo');
    }
  };

  const handleImport = async () => {
    setError('');
    setResult(null);
    setImporting(true);

    try {
      const list = parseList(text);
      const summary = await onImport(list);
      setResult(summary);
    } catch (err) {
      setError(err.message || 'No se pudo importar la lista');
    } finally {
      setImporting(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    },
    modal: {
      background: '#1f2937', borderRadius: '0.75rem', border: '1px solid #374151',
      padding: '1.5rem', width: '100%', maxWidth: '36rem', maxHeight: '90vh',
      overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1rem'
    },
    title: { color: '#f9fafb', fontSize: '1.25rem', fontWeight: '700', margin: 0 },
    closeButton: {
      background: 'none', border: 'none', color: '#9ca3af',
      cursor: 'pointer', display: 'flex', padding: '0.25rem'
    },
    label: {
      display: 'block', color: '#e5e7eb', fontSize: '0.875rem',
      fontWeight: '600', marginBottom: '0.5rem'
    },
    textarea: {
      width: '100%', minHeight: '12rem', boxSizing: 'border-box',
      background: '#111827', color: '#e5e7eb', border: '1px solid #374151',
      borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8rem',
      fontFamily: 'monospace', resize: 'vertical'
    },
    fileRow: {
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      flexWrap: 'wrap', marginBottom: '1rem'
    },
    fileLabel: {
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      background: '#374151', color: '#e5e7eb', padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
    },
    fileName: { color: '#9ca3af', fontSize: '0.8rem' },
    hint: { color: '#6b7280', fontSize: '0.78rem', lineHeight: '1.5', marginTop: '0.5rem' },
    error: {
      background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5',
      padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginTop: '0.75rem'
    },
    success: {
      background: '#064e3b', border: '1px solid #065f46', color: '#6ee7b7',
      padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginTop: '0.75rem'
    },
    actions: { display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' },
    primary: {
      flex: 1, minWidth: '10rem', background: importing ? '#4b5563' : '#6366f1',
      color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem',
      fontWeight: '600', cursor: importing ? 'not-allowed' : 'pointer'
    },
    secondary: {
      flex: 1, minWidth: '8rem', background: 'transparent', color: '#9ca3af',
      border: '1px solid #374151', borderRadius: '0.5rem', padding: '0.75rem',
      fontWeight: '500', cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Importar animes</h2>
          <button onClick={handleClose} style={styles.closeButton}><X size={20} /></button>
        </div>

        <div style={styles.fileRow}>
          <label style={styles.fileLabel}>
            <FileJson size={16} /> Elegir archivo JSON
            <input type="file" accept=".json,application/json" onChange={handleFile} style={{ display: 'none' }} />
          </label>
          {fileName && <span style={styles.fileName}>{fileName}</span>}
        </div>

        <label style={styles.label}>O pegá la lista acá</label>
        <textarea
          value={text}
          onChange={(event) => { setText(event.target.value); setError(''); setResult(null); }}
          style={styles.textarea}
          placeholder={'Podés pegar el JSON completo o líneas separadas por tabs:\n134\tmob psycho\tShonen\tAbandonado\t\t17'}
          spellCheck={false}
        />

        <p style={styles.hint}>
          Acepta el JSON de <code>imports/animes.json</code> o la lista original separada por tabs.
          Los animes que ya existen en tu cuenta se omiten automáticamente.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {result && (
          <div style={styles.success}>
            Importados: {result.imported} · Ya existían: {result.skipped} · Fallidos: {result.failed}
          </div>
        )}

        <div style={styles.actions}>
          <button onClick={handleClose} style={styles.secondary}>Cerrar</button>
          <button onClick={handleImport} disabled={importing || !text.trim()} style={styles.primary}>
            <Upload size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
            {importing ? 'Importando...' : 'Importar lista'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportAnimeModal;