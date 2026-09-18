import React, { useState, useEffect } from 'react';
import FileTransfer from './components/FileTransfer';
import SignatureHosting from './components/SignatureHosting';
import RecipientView from './components/RecipientView';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState('files');
  const [toastMessage, setToastMessage] = useState(null);
  const [recipientFileId, setRecipientFileId] = useState(null);

  // Estado de Autenticación
  const [token, setToken] = useState(() => localStorage.getItem('drive_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('drive_user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Detectar si la ruta es una URL de descarga pública (/v/:id)
    const path = window.location.pathname;
    const match = path.match(/^\/v\/([a-zA-Z0-9_-]+)/);
    if (match) {
      setRecipientFileId(match[1]);
    }
  }, []);

  // Revalidar sesión existente con el backend
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Sesión expirada');
          return res.json();
        })
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('drive_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    showToast(`Bienvenido, ${newUser.name || newUser.email}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('drive_token');
    localStorage.removeItem('drive_user');
    setToken(null);
    setUser(null);
    setCurrentTab('files');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Si es la vista pública del destinatario (/v/:id), NO requiere login
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
            Acceso Empleados
          </a>
        </header>

        <RecipientView fileId={recipientFileId} />
      </div>
    );
  }

  // 2. Si el colaborador no ha iniciado sesión, mostrar formulario exclusivo
  if (!token || !user) {
    return (
      <div>
        <header className="app-header">
          <div className="brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>BillonMail Tools</span>
            <span className="brand-badge">SekaiTech</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            drive.sekaitech.com.pe
          </div>
        </header>

        <main className="app-main">
          <AuthModal onLoginSuccess={handleLoginSuccess} />
        </main>
        <Toast message={toastMessage} />
      </div>
    );
  }

  const isSuperAdmin = user.role === 'superadmin';

  // 3. Vista principal para colaboradores autenticados
  return (
    <div>
      <header className="app-header">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>BillonMail Tools</span>
          <span className="brand-badge">SekaiTech</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="user-pill">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{user.email}</span>
            {isSuperAdmin && (
              <span style={{
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                SuperAdmin
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Salir
          </button>
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

          {/* Pestaña exclusiva para SuperAdmin */}
          {isSuperAdmin && (
            <button
              className={`tab-btn ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('admin')}
              style={{
                color: currentTab === 'admin' ? 'var(--text)' : '#b45309'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              3. Aprobación de Usuarios
            </button>
          )}
        </div>

        {/* Vistas */}
        {currentTab === 'files' && (
          <FileTransfer token={token} onToast={showToast} />
        )}
        {currentTab === 'signatures' && (
          <SignatureHosting token={token} onToast={showToast} />
        )}
        {currentTab === 'admin' && isSuperAdmin && (
          <AdminPanel token={token} onToast={showToast} />
        )}
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
