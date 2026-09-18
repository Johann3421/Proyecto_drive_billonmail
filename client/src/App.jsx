import React, { useState, useEffect } from 'react';
import FileTransfer from './components/FileTransfer';
import SignatureHosting from './components/SignatureHosting';
import RecipientView from './components/RecipientView';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import GalleryHistory from './components/GalleryHistory';
import Toast from './components/Toast';

export default function App() {
  const [currentSection, setCurrentSection] = useState('upload'); // 'upload' | 'gallery' | 'admin'
  const [uploadTab, setUploadTab] = useState('files'); // 'files' | 'signatures'
  const [pendingCount, setPendingCount] = useState(0);
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

  // Si es superadmin, consultar usuarios pendientes de aprobación
  useEffect(() => {
    if (token && user?.role === 'superadmin') {
      fetch('/api/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.users) {
            setPendingCount(data.users.filter((u) => u.status === 'pending').length);
          }
        })
        .catch(() => {});
    }
  }, [token, user]);

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
    setCurrentSection('upload');
    setUploadTab('files');
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

  // 3. Vista principal para colaboradores autenticados con navegación distribuida
  return (
    <div>
      <header className="app-header">
        <div className="header-brand-nav">
          <div
            className="brand"
            onClick={() => setCurrentSection('upload')}
            title="Ir al inicio"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>BillonMail Tools</span>
            <span className="brand-badge">SekaiTech</span>
          </div>

          {/* Navegación Principal en el Header */}
          <nav className="header-nav">
            <button
              className={`nav-btn ${currentSection === 'upload' ? 'active' : ''}`}
              onClick={() => setCurrentSection('upload')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Subir Archivos</span>
            </button>

            <button
              className={`nav-btn ${currentSection === 'gallery' ? 'active' : ''}`}
              onClick={() => setCurrentSection('gallery')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Mi Galería</span>
            </button>

            {isSuperAdmin && (
              <button
                className={`nav-btn nav-btn-admin ${currentSection === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentSection('admin')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Aprobación de Usuarios</span>
                {pendingCount > 0 && (
                  <span className="nav-badge" title={`${pendingCount} solicitudes pendientes`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Datos de usuario y Salir */}
        <div className="header-user-actions">
          <div className="user-pill">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="user-email-text">{user.email}</span>
            {isSuperAdmin && (
              <span className="badge-admin">SuperAdmin</span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="btn-logout"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* APARTADO 1: SUBIR Y COMPARTIR ARCHIVOS / FIRMAS */}
        {currentSection === 'upload' && (
          <div>
            <div className="upload-header-bar">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.2rem' }}>
                  Subir y Compartir
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Selecciona la herramienta según el tipo de recurso que necesitas enviar o alojar.
                </p>
              </div>

              {/* Selector exclusivo para las dos herramientas de subida */}
              <div className="tab-bar" style={{ margin: 0 }}>
                <button
                  className={`tab-btn ${uploadTab === 'files' ? 'active' : ''}`}
                  onClick={() => setUploadTab('files')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Archivos Grandes (&gt;10MB)
                </button>
                <button
                  className={`tab-btn ${uploadTab === 'signatures' ? 'active' : ''}`}
                  onClick={() => setUploadTab('signatures')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Firmas &amp; GIFs para Correos
                </button>
              </div>
            </div>

            {/* Herramientas de subida */}
            {uploadTab === 'files' ? (
              <FileTransfer token={token} onToast={showToast} />
            ) : (
              <SignatureHosting token={token} onToast={showToast} />
            )}
          </div>
        )}

        {/* APARTADO 2: MI GALERÍA E HISTORIAL */}
        {currentSection === 'gallery' && (
          <GalleryHistory token={token} user={user} onToast={showToast} />
        )}

        {/* APARTADO 3: APROBACIÓN DE USUARIOS (SUPERADMIN) */}
        {currentSection === 'admin' && isSuperAdmin && (
          <AdminPanel
            token={token}
            onToast={showToast}
            onPendingCountChange={setPendingCount}
          />
        )}
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}

