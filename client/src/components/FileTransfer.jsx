import React, { useState, useRef } from 'react';

export default function FileTransfer({ onToast }) {
  const [retentionDays, setRetentionDays] = useState(15);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploading(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('retentionDays', retentionDays);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/files/upload', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 201) {
        const data = JSON.parse(xhr.responseText);
        setResult(data.file);
        onToast('¡Archivo subido exitosamente! Enlace listo para enviar por correo.');
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          alert(err.error || 'Error al subir el archivo');
        } catch {
          alert('Error de conexión al subir el archivo');
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      alert('Error de red al intentar subir el archivo.');
    };

    xhr.send(formData);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast(`¡${label} copiado al portapapeles! Pégalo en BillonMail.`);
    });
  };

  const formatMb = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Subir Video o Archivo Pesado</h2>
        <p>
          BillonMail limita los correos a 10MB. Sube aquí tus videos (MP4, MOV), PDFs grandes o archivos ZIP de hasta 2GB. 
          El destinatario recibirá un enlace limpio para previsualizar y descargar sin que tu buzón se sature.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
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
            handleUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        <svg className="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
        <div className="drop-title">Haz clic aquí o arrastra un video o archivo</div>
        <div className="drop-subtitle">Formatos soportados: MP4, MOV, PDF, ZIP, RAR (Sin restricción de 10MB)</div>
      </div>

      {isUploading && file && (
        <div className="file-queue">
          <div className="file-item">
            <div style={{ flex: 1 }}>
              <div className="file-info">
                <strong>{file.name}</strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  {progress}% ({formatMb(file.size)} MB)
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="result-box">
          <div className="result-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            ¡Archivo listo para compartir en tu correo de BillonMail!
          </div>
          <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.75rem' }}>
            {result.originalName} ({formatMb(result.sizeBytes)} MB) • Expira el: {new Date(result.expiresAt).toLocaleDateString()}
          </div>
          <div className="link-copy-row">
            <input type="text" readOnly className="link-input" value={result.shareUrl} />
            <button
              className="btn-action"
              onClick={() => copyToClipboard(result.shareUrl, 'Enlace de visualización')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copiar Enlace
            </button>
          </div>
        </div>
      )}

      <div className="options-row">
        <div>
          <span>Tiempo de caducidad: </span>
          <select
            className="select-input"
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            disabled={isUploading}
          >
            <option value={15}>15 días (Recomendado)</option>
            <option value={30}>30 días</option>
            <option value={7}>7 días</option>
          </select>
        </div>
        <div>Limpieza automática por TTL para preservar el disco del servidor.</div>
      </div>
    </div>
  );
}
