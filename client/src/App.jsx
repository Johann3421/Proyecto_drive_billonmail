import React, { useState, useEffect } from 'react';
import FileTransfer from './components/FileTransfer';
import SignatureHosting from './components/SignatureHosting';
import RecipientView from './components/RecipientView';
import Toast from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState('files');
  const [toastMessage, setToastMessage] = useState(null);
  const [recipientFileId, setRecipientFileId] = useState(null);

  useEffect(() => {
    // Detectar si la ruta es una URL de descarga (/v/:id)
    const path = window.location.pathname;
    const match = path.match(/^\/v\/([a-zA-Z0-9_-]+)/);
    if (match) {
      setRecipientFileId(match[1]);
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Si es la vista pública del destinatario
  if (recipientFileId) {
    return (
      <div>
        <header className="app-header">
          <div className="brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>BillonMail Drive</span>
            <span className="brand-badge">Descargas</span>
          </div>
          <a
            href="/"
            style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
          >
            Ir al Portal
          </a>
        </header>

        <RecipientView fileId={recipientFileId} />
      </div>
    );
  }

  // Vista principal para colaboradores de la empresa
  return (
    <div>
      <header className="app-header">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>BillonMail Tools</span>
          <span className="brand-badge">Portal Interno</span>
        </div>
        <div className="user-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>colaborador@empresa.com</span>
        </div>
      </header>

      <main className="app-main">
        {/* Selector de pestañas */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${currentTab === 'files' ? 'active' : ''}`}
            onClick={() => setCurrentTab('files')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            1. Enviar Archivos Grandes (&gt;10MB)
          </button>
          <button
            className={`tab-btn ${currentTab === 'signatures' ? 'active' : ''}`}
            onClick={() => setCurrentTab('signatures')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            2. Subir Imágenes y GIFs (Footers / Firmas)
          </button>
        </div>

        {/* Paneles de Contenido */}
        {currentTab === 'files' ? (
          <FileTransfer onToast={showToast} />
        ) : (
          <SignatureHosting onToast={showToast} />
        )}
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
