import React, { useState, useEffect } from 'react';

export default function AdminPanel({ token, onToast, onPendingCountChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/auth/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setUsers(data.users);
          if (onPendingCountChange) {
            onPendingCountChange(data.users.filter((u) => u.status === 'pending').length);
          }
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/auth/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      setActionLoadingId(null);

      if (data.success) {
        onToast(`Usuario ${newStatus === 'approved' ? 'aprobado' : 'actualizado'} con éxito.`);
        setUsers((prev) => {
          const updated = prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
          if (onPendingCountChange) {
            onPendingCountChange(updated.filter((u) => u.status === 'pending').length);
          }
          return updated;
        });
      } else {
        alert(data.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      setActionLoadingId(null);
      alert('Error de conexión con el servidor.');
    }
  };

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Gestión de Usuarios y Aprobaciones</h2>
          <p>Como SuperAdmin, autorizas o rechazas qué colaboradores pueden acceder al portal de envíos y firmas.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="btn-action"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid var(--border)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Actualizar Lista
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        fontSize: '0.85rem'
      }}>
        <div>Total registrados: <strong>{users.length}</strong></div>
        <div style={{ color: pendingCount > 0 ? '#b45309' : 'inherit' }}>
          Pendientes de aprobación: <strong>{pendingCount}</strong>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Cargando usuarios...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Colaborador</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Correo</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Rol</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Estado</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSuperAdmin = u.role === 'superadmin';
                const isPending = u.status === 'pending';
                const isApproved = u.status === 'approved';

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.name || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isSuperAdmin ? '#0f172a' : '#f1f5f9',
                        color: isSuperAdmin ? '#ffffff' : '#475569'
                      }}>
                        {isSuperAdmin ? 'SuperAdmin' : 'Usuario'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: isApproved ? '#ecfdf5' : isPending ? '#fef3c7' : '#fef2f2',
                        color: isApproved ? '#065f46' : isPending ? '#92400e' : '#991b1b'
                      }}>
                        {isApproved ? '✓ Aprobado' : isPending ? '⏳ Pendiente' : '✕ Rechazado'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {isSuperAdmin ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Titular Principal</span>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          {!isApproved && (
                            <button
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleStatusChange(u.id, 'approved')}
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '5px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Aprobar
                            </button>
                          )}
                          {u.status !== 'rejected' && (
                            <button
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleStatusChange(u.id, 'rejected')}
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '5px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Suspender
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
