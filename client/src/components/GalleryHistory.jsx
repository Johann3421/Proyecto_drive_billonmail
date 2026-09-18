import React, { useState, useEffect } from 'react';

export default function GalleryHistory({ token, user, onToast }) {
  const [subView, setSubView] = useState('signatures'); // 'signatures' | 'files'
  const [signatures, setSignatures] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedSig, setSelectedSig] = useState(null);
  const isSuperAdmin = user?.role === 'superadmin';

  const loadData = () => {
    setLoading(true);
    const query = showAll && isSuperAdmin ? '?all=true' : '';

    Promise.all([
      fetch(`/api/signatures/my${query}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/files/my${query}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([sigData, fileData]) => {
        setLoading(false);
        if (sigData.success) setSignatures(sigData.signatures || []);
        if (fileData.success) setFiles(fileData.files || []);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    loadData();
  }, [token, showAll]);

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast(`¡${label} copiado al portapapeles!`);
    });
  };

  const deleteSignature = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar la firma "${name}" de tu galería?`)) return;
    try {
      const res = await fetch(`/api/signatures/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        onToast('Firma eliminada de la galería.');
        setSignatures((prev) => prev.filter((s) => s.id !== id));
        if (selectedSig?.id === id) setSelectedSig(null);
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch {
      alert('Error de conexión al eliminar.');
    }
  };

  const deleteFile = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el archivo "${name}"? Su enlace dejará de funcionar.`)) return;
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        onToast('Archivo eliminado correctamente.');
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch {
      alert('Error de conexión al eliminar.');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Mi Galería e Historial</h2>
          <p>Consulta, reutiliza los enlaces de tus firmas o gestiona las transferencias de archivos que tienes activas.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isSuperAdmin && (
            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', background: '#f1f5f9', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              <span>Ver todo el equipo (SuperAdmin)</span>
            </label>
          )}

          <button
            onClick={loadData}
            className="btn-action"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid var(--border)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refrescar
          </button>
        </div>
      </div>

      {/* Selector de sub-vista */}
      <div style={{
        display: 'flex',
        background: '#f1f5f9',
        padding: '3px',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setSubView('signatures')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: subView === 'signatures' ? '#ffffff' : 'transparent',
            color: subView === 'signatures' ? '#0f172a' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: subView === 'signatures' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Mi Galería de Firmas & GIFs ({signatures.length})
        </button>

        <button
          onClick={() => setSubView('files')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: subView === 'files' ? '#ffffff' : 'transparent',
            color: subView === 'files' ? '#0f172a' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: subView === 'files' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Historial de Archivos Grandes ({files.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando tu galería...
        </div>
      ) : subView === 'signatures' ? (
        /* VISTA 1: Galería de Firmas */
        signatures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fafafa', borderRadius: '8px', border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Aún no has subido ninguna imagen o GIF de firma a tu galería.
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sube tus firmas en la pestaña "2. Subir Imágenes y GIFs" y aparecerán aquí automáticamente.
            </span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {signatures.map((sig) => (
              <div
                key={sig.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: '140px',
                  background: '#f8fafc',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem'
                }}>
                  <img
                    src={sig.directUrl}
                    alt={sig.originalName}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>

                {/* Details & Actions */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', wordBreak: 'break-word' }}>
                      {sig.originalName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {formatSize(sig.sizeBytes)} • {new Date(sig.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => copyText(sig.directUrl, 'Enlace directo')}
                        style={{
                          flex: 1,
                          background: '#0f172a',
                          color: '#fff',
                          border: 'none',
                          padding: '0.45rem',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Copiar Directo (.gif)
                      </button>
                      <button
                        onClick={() => copyText(sig.htmlCode, 'Código HTML')}
                        style={{
                          flex: 1,
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid var(--border)',
                          padding: '0.45rem',
                          borderRadius: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Copiar HTML
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <button
                        onClick={() => setSelectedSig(sig)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Ver todos los enlaces
                      </button>

                      <button
                        onClick={() => deleteSignature(sig.id, sig.originalName)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* VISTA 2: Historial de Archivos Grandes */
        files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fafafa', borderRadius: '8px', border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              No tienes transferencias activas registradas.
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sube videos o archivos pesados en la pestaña "1. Enviar Archivos Grandes" para gestionarlos aquí.
            </span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Archivo</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Tamaño</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Caducidad</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Descargas</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{file.originalName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Subido el: {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                      {formatSize(file.sizeBytes)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: file.isExpired ? '#fef2f2' : '#ecfdf5',
                        color: file.isExpired ? '#991b1b' : '#065f46'
                      }}>
                        {file.isExpired ? 'Caducado' : `${file.daysRemaining} días restantes`}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                      {file.downloadsCount} descargas
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          onClick={() => copyText(file.shareUrl, 'Enlace de correo')}
                          style={{
                            background: '#0f172a',
                            color: '#fff',
                            border: 'none',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '5px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Copiar Enlace
                        </button>
                        <a
                          href={file.shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid var(--border)',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '5px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          Ver ↗
                        </a>
                        <button
                          onClick={() => deleteFile(file.id, file.originalName)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            padding: '0.35rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          title="Eliminar archivo"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal para ver todos los formatos de enlace de una firma */}
      {selectedSig && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '650px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Enlaces para: {selectedSig.originalName}</h3>
              <button onClick={() => setSelectedSig(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                  Enlace directo (.gif / .png)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" readOnly value={selectedSig.directUrl} className="link-input" />
                  <button className="btn-action" onClick={() => copyText(selectedSig.directUrl, 'Enlace directo')}>Copiar</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                  Código HTML para correo / web
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" readOnly value={selectedSig.htmlCode} className="link-input" />
                  <button className="btn-action" onClick={() => copyText(selectedSig.htmlCode, 'Código HTML')}>Copiar</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                  HTML con hipervínculo cliqueable
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" readOnly value={selectedSig.htmlWithLink} className="link-input" />
                  <button className="btn-action" onClick={() => copyText(selectedSig.htmlWithLink, 'HTML con enlace')}>Copiar</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                  Markdown
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" readOnly value={selectedSig.markdown} className="link-input" />
                  <button className="btn-action" onClick={() => copyText(selectedSig.markdown, 'Markdown')}>Copiar</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                className="btn-action"
                style={{ background: '#0f172a' }}
                onClick={() => setSelectedSig(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
