import React, { useState, useRef, useEffect } from 'react';

export default function SignatureHosting({ token, onToast }) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Cargar firmas recientes al montar
  useEffect(() => {
    fetch('/api/signatures/recent', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.signatures && data.signatures.length > 0) {
          setRecentList(data.signatures);
          if (!currentSignature) {
            // Mostrar la más reciente por defecto
            setCurrentSignature(data.signatures[0]);
          }
        }
      })
      .catch((err) => console.warn('No se pudieron obtener firmas recientes:', err));
  }, [token]);

  const handleImageUpload = (file) => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    fetch('/api/signatures/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        setIsUploading(false);
        if (data.success && data.signature) {
          setCurrentSignature(data.signature);
          setRecentList((prev) => [data.signature, ...prev.filter((item) => item.id !== data.signature.id)]);
          onToast('¡Firma/GIF subido al servidor corporativo! Opciones generadas.');
        } else {
          alert(data.error || 'Error al subir la imagen');
        }
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        alert('Error de conexión al subir la imagen');
      });
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      onToast('¡Copiado al portapapeles!');
      setTimeout(() => setCopiedKey(null), 1800);
    });
  };

  // Ejemplo predeterminado si no hay ninguna firma subida aún
  const signatureData = currentSignature || {
    filename: 'FIRMA-ACUERDO-MARCO-KENYA.gif',
    originalName: 'FIRMA-ACUERDO-MARCO-KENYA.gif',
    directUrl: 'https://i.postimg.cc/FKT5FCqM/FIRMA-ACUERDO-MARCO-KENYA.gif',
    viewUrl: 'https://postimg.cc/Lqg0NDmD',
    htmlCode: "<img src='https://i.postimg.cc/FKT5FCqM/FIRMA-ACUERDO-MARCO-KENYA.gif' border='0' alt='FIRMA-ACUERDO-MARCO-KENYA'>",
    htmlWithLink: "<a href='https://empresa.com' target='_blank'><img src='https://i.postimg.cc/FKT5FCqM/FIRMA-ACUERDO-MARCO-KENYA.gif' border='0' alt='FIRMA-ACUERDO-MARCO-KENYA'></a>",
    markdown: '![FIRMA-ACUERDO-MARCO-KENYA.gif](https://i.postimg.cc/FKT5FCqM/FIRMA-ACUERDO-MARCO-KENYA.gif)',
    bbcode: '[img]https://i.postimg.cc/FKT5FCqM/FIRMA-ACUERDO-MARCO-KENYA.gif[/img]'
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Alojador de Imágenes y GIFs para Firmas (Footers)</h2>
        <p>
          Sube la imagen (PNG, JPG) o GIF animado de tu firma corporativa. El archivo quedará alojado de forma permanente en el 
          servidor de la empresa para que puedas usarlo en BillonMail sin consumir los 10MB de límite de envío.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/gif,image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
          }
        }}
      />

      <div
        className={`dropzone ${isDragOver ? 'dragover' : ''}`}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        <svg className="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div className="drop-title">
          {isUploading ? 'Subiendo y procesando imagen...' : 'Haz clic aquí o arrastra tu GIF o Imagen de firma'}
        </div>
        <div className="drop-subtitle">
          Soporta GIFs animados, PNG transparente, JPG y WebP (Alojamiento permanente corporativo)
        </div>
      </div>

      {/* Results Container matching Postimages */}
      <div style={{ marginTop: '1.75rem' }}>
        {/* Live Preview */}
        <div className="preview-card">
          <img
            src={signatureData.directUrl}
            alt={signatureData.originalName}
            onError={(e) => {
              e.target.src = 'https://i.postimg.cc/FKT5FCqM/FIRMA-ACUERDO-MARCO-KENYA.gif';
            }}
          />
        </div>

        {/* Postimages Link Rows */}
        <div className="postimg-container">
          
          {/* Row 1: Enlace directo */}
          <div className="postimg-row">
            <label className="postimg-label" htmlFor="inp-direct">
              Enlace directo
              <span className="badge-rec">Ideal para BillonMail</span>
            </label>
            <div className="postimg-input-group">
              <input
                id="inp-direct"
                className="postimg-input"
                readOnly
                value={signatureData.directUrl}
              />
              <button
                className={`btn-copy-code ${copiedKey === 'direct' ? 'copied' : ''}`}
                onClick={() => handleCopy(signatureData.directUrl, 'direct')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copiedKey === 'direct' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Enlace de visor */}
          <div className="postimg-row">
            <label className="postimg-label" htmlFor="inp-view">
              Enlace de visor
            </label>
            <div className="postimg-input-group">
              <input
                id="inp-view"
                className="postimg-input"
                readOnly
                value={signatureData.viewUrl}
              />
              <button
                className={`btn-copy-code ${copiedKey === 'view' ? 'copied' : ''}`}
                onClick={() => handleCopy(signatureData.viewUrl, 'view')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copiedKey === 'view' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Row 3: Código HTML */}
          <div className="postimg-row">
            <label className="postimg-label" htmlFor="inp-html">
              Código HTML (Web / Correo)
              <span className="badge-rec">HTML</span>
            </label>
            <div className="postimg-input-group">
              <input
                id="inp-html"
                className="postimg-input"
                readOnly
                value={signatureData.htmlCode}
              />
              <button
                className={`btn-copy-code ${copiedKey === 'html' ? 'copied' : ''}`}
                onClick={() => handleCopy(signatureData.htmlCode, 'html')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copiedKey === 'html' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Row 4: HTML con enlace cliqueable */}
          <div className="postimg-row">
            <label className="postimg-label" htmlFor="inp-web">
              HTML con enlace cliqueable
            </label>
            <div className="postimg-input-group">
              <input
                id="inp-web"
                className="postimg-input"
                readOnly
                value={signatureData.htmlWithLink}
              />
              <button
                className={`btn-copy-code ${copiedKey === 'web' ? 'copied' : ''}`}
                onClick={() => handleCopy(signatureData.htmlWithLink, 'web')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copiedKey === 'web' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Row 5: Markdown */}
          <div className="postimg-row">
            <label className="postimg-label" htmlFor="inp-md">
              Markdown
            </label>
            <div className="postimg-input-group">
              <input
                id="inp-md"
                className="postimg-input"
                readOnly
                value={signatureData.markdown}
              />
              <button
                className={`btn-copy-code ${copiedKey === 'md' ? 'copied' : ''}`}
                onClick={() => handleCopy(signatureData.markdown, 'md')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copiedKey === 'md' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Row 6: BBCode */}
          <div className="postimg-row">
            <label className="postimg-label" htmlFor="inp-bb">
              Código para foros (BBCode)
            </label>
            <div className="postimg-input-group">
              <input
                id="inp-bb"
                className="postimg-input"
                readOnly
                value={signatureData.bbcode}
              />
              <button
                className={`btn-copy-code ${copiedKey === 'bb' ? 'copied' : ''}`}
                onClick={() => handleCopy(signatureData.bbcode, 'bb')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copiedKey === 'bb' ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Quick history selector if there are recent uploads */}
        {recentList.length > 1 && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Tus firmas / imágenes recientes:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {recentList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentSignature(item)}
                  style={{
                    background: currentSignature?.id === item.id ? '#0f172a' : '#f1f5f9',
                    color: currentSignature?.id === item.id ? '#ffffff' : '#334155',
                    border: '1px solid var(--border)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '5px',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {item.originalName || item.filename}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.45 }}>
          💡 <strong>Cómo insertarlo en BillonMail:</strong> Entra a la configuración de firma de tu cliente de correo, haz clic en el icono de <strong>Insertar Imagen</strong> y pega el <strong>"Enlace directo"</strong>. Tu GIF o imagen se mostrará automáticamente sin añadirle peso a tus correos.
        </div>
      </div>
    </div>
  );
}
