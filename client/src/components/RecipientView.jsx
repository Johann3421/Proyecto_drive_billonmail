import React, { useEffect, useState } from 'react';

export default function RecipientView({ fileId }) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/files/${fileId}/meta`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 410) throw new Error('Este archivo ha expirado y ya no se encuentra disponible.');
          if (res.status === 404) throw new Error('El enlace solicitado no existe o fue eliminado.');
          throw new Error('Error al consultar el archivo.');
        }
        return res.json();
      })
      .then((data) => {
        setMeta(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [fileId]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="recipient-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Cargando información del archivo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipient-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>Enlace no disponible</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recipient-wrapper">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            Portal de Descargas Corporativo
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem', color: '#0f172a' }}>
            {meta.originalName}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Tamaño: <strong>{formatSize(meta.sizeBytes)}</strong> • Expira el: {new Date(meta.expiresAt).toLocaleDateString()}
          </p>
        </div>

        {meta.isVideo && (
          <div className="video-container">
            <video controls preload="metadata">
              <source src={meta.streamUrl} type={meta.mimeType || 'video/mp4'} />
              Tu navegador no soporta reproducción directa de video.
            </video>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <a
            href={meta.downloadUrl}
            className="btn-action"
            style={{ textDecoration: 'none', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar Archivo Original ({formatSize(meta.sizeBytes)})
          </a>

          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Descargas registradas: {meta.downloadsCount}
          </div>
        </div>
      </div>
    </div>
  );
}
