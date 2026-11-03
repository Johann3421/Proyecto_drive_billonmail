import React, { useEffect, useState } from 'react';

export default function ImageViewer({ imageId }) {
  const [sig, setSig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetch(`/api/signatures/${imageId}/meta`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('La imagen o firma solicitada no existe o fue eliminada.');
          throw new Error('Error al cargar la imagen.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.signature) {
          setSig(data.signature);
        } else {
          throw new Error(data.error || 'No se pudo obtener la firma.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [imageId]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
  };

  if (loading) {
    return (
      <div className="recipient-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Cargando firma / imagen corporativa...</p>
        </div>
      </div>
    );
  }

  if (error || !sig) {
    return (
      <div className="recipient-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>Imagen no disponible</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{error}</p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            ← Volver al portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="recipient-wrapper" style={{ maxWidth: '820px' }}>
      <div className="card">
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            Visor de Firmas &amp; Recursos Corporativos
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem', color: '#0f172a' }}>
            {sig.originalName}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Tipo: <strong>{sig.mimeType}</strong> • Peso: <strong>{formatSize(sig.sizeBytes)}</strong>
          </p>
        </div>

        {/* Vista previa central con fondo de cuadrícula para transparencias */}
        <div style={{
          background: 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 16px 16px',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '2rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '180px',
          marginBottom: '1.5rem',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <img
            src={sig.directUrl}
            alt={sig.originalName}
            style={{
              maxWidth: '100%',
              maxHeight: '360px',
              objectFit: 'contain',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          />
        </div>

        {/* Botones de acción rápida */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <button
            className="btn-action"
            style={{ flex: 1, minWidth: '180px', justifyContent: 'center' }}
            onClick={() => copyToClipboard(sig.directUrl, 'direct')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>{copiedKey === 'direct' ? '¡Copiado!' : 'Copiar Enlace Directo'}</span>
          </button>

          <button
            className="btn-action"
            style={{ flex: 1, minWidth: '180px', justifyContent: 'center', background: '#334155' }}
            onClick={() => copyToClipboard(sig.htmlCode, 'html')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>{copiedKey === 'html' ? '¡Copiado!' : 'Copiar Código HTML'}</span>
          </button>

          <a
            href={sig.directUrl}
            download={sig.originalName}
            className="btn-action"
            style={{
              textDecoration: 'none',
              background: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid var(--border)',
              justifyContent: 'center',
              minWidth: '150px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar
          </a>
        </div>

        {/* Tabla de todos los formatos listos para copiar */}
        <div className="postimg-container">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
            Formatos de inserción disponibles:
          </div>

          <div className="postimg-row">
            <label className="postimg-label">Enlace directo (.gif/.png)</label>
            <div className="postimg-input-group">
              <input className="postimg-input" readOnly value={sig.directUrl} />
              <button
                className={`btn-copy-code ${copiedKey === 'direct2' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(sig.directUrl, 'direct2')}
              >
                {copiedKey === 'direct2' ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="postimg-row">
            <label className="postimg-label">Código HTML (Web / Correo)</label>
            <div className="postimg-input-group">
              <input className="postimg-input" readOnly value={sig.htmlCode} />
              <button
                className={`btn-copy-code ${copiedKey === 'html2' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(sig.htmlCode, 'html2')}
              >
                {copiedKey === 'html2' ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="postimg-row">
            <label className="postimg-label">HTML con enlace cliqueable</label>
            <div className="postimg-input-group">
              <input className="postimg-input" readOnly value={sig.htmlWithLink} />
              <button
                className={`btn-copy-code ${copiedKey === 'link2' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(sig.htmlWithLink, 'link2')}
              >
                {copiedKey === 'link2' ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="postimg-row">
            <label className="postimg-label">Markdown</label>
            <div className="postimg-input-group">
              <input className="postimg-input" readOnly value={sig.markdown} />
              <button
                className={`btn-copy-code ${copiedKey === 'md2' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(sig.markdown, 'md2')}
              >
                {copiedKey === 'md2' ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Alojado permanentemente en el servidor corporativo de SekaiTech.
        </div>
      </div>
    </div>
  );
}
