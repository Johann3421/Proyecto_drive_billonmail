import React, { useState } from 'react';

export default function AuthModal({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error');
        return;
      }

      if (isLogin) {
        localStorage.setItem('drive_token', data.token);
        localStorage.setItem('drive_user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      } else {
        setSuccessMessage(data.message);
        setEmail('');
        setPassword('');
        setName('');
        // Sugerir cambio a login después de registrarse
        setTimeout(() => {
          setIsLogin(true);
        }, 3500);
      }
    } catch (err) {
      setLoading(false);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="auth-card">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: '#0f172a',
          color: '#ffffff',
          marginBottom: '0.75rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
          Portal Corporativo SekaiTech
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Acceso exclusivo para colaboradores de la empresa
        </p>
      </div>

      {/* Switcher Login / Register */}
      <div style={{
        display: 'flex',
        background: '#f1f5f9',
        padding: '3px',
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        <button
          type="button"
          onClick={() => { setIsLogin(true); setError(null); setSuccessMessage(null); }}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            background: isLogin ? '#ffffff' : 'transparent',
            color: isLogin ? '#0f172a' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: isLogin ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
          }}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(false); setError(null); setSuccessMessage(null); }}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            background: !isLogin ? '#ffffff' : 'transparent',
            color: !isLogin ? '#0f172a' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: !isLogin ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
          }}
        >
          Solicitar Cuenta
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          fontSize: '0.82rem',
          marginBottom: '1.25rem',
          lineHeight: 1.4
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          fontSize: '0.82rem',
          marginBottom: '1.25rem',
          lineHeight: 1.4
        }}>
          ✓ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLogin && (
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '0.88rem'
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Correo Corporativo
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@sekaitech.com.pe"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.88rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.88rem'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-action"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.75rem',
            fontSize: '0.9rem',
            marginTop: '0.5rem'
          }}
        >
          {loading ? 'Procesando...' : (isLogin ? 'Ingresar al Portal' : 'Enviar Solicitud de Registro')}
        </button>
      </form>

      {!isLogin && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.4 }}>
          * Los registros requieren validación y aprobación manual por parte del SuperAdmin de la empresa.
        </div>
      )}
    </div>
  );
}
