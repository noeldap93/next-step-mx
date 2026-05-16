import React, { useEffect, useState, useCallback } from 'react';
import { listAdmins, addAdmin, removeAdmin, BOOTSTRAP_ADMIN_EMAIL } from '../lib/admin.js';

export default function AdminsPage({ user: currentUser }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAdmins(await listAdmins());
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    setAdding(true);
    try {
      await addAdmin({ email: newEmail, addedBy: currentUser.uid });
      setNewEmail('');
      await refresh();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (email) => {
    if (!confirm(`¿Quitar acceso de admin a ${email}?`)) return;
    setError(null);
    try {
      await removeAdmin(email);
      await refresh();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  return (
    <section className="ad-section">
      <div className="ad-section-head">
        <h2 className="ad-section-title">Administradores</h2>
      </div>

      <p className="ad-help">
        Cualquier persona con una cuenta de Google que aparezca aquí podrá entrar al panel.
        El usuario <code>{BOOTSTRAP_ADMIN_EMAIL}</code> es admin permanente y no puede eliminarse.
      </p>

      <form className="ad-form ad-form--inline" onSubmit={handleAdd}>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="persona@gmail.com"
          required
        />
        <button type="submit" className="ad-btn ad-btn--primary" disabled={adding}>
          {adding ? 'Añadiendo…' : 'Añadir admin'}
        </button>
      </form>

      {error && <div className="ad-error">{error}</div>}
      {loading && <div className="ad-loading-inline">cargando…</div>}

      <div className="ad-list">
        {admins.map((a) => (
          <div key={a.id} className="ad-card ad-card--row">
            <div>
              <div className="ad-card-title">{a.email}</div>
              <div className="ad-card-meta">
                {a.bootstrap && <span className="ad-chip ad-chip--accent">bootstrap</span>}
                {a.addedAt?.toDate && (
                  <span className="ad-chip ad-chip--muted">añadido: {a.addedAt.toDate().toLocaleString()}</span>
                )}
              </div>
            </div>
            {!a.bootstrap && (
              <button
                type="button"
                className="ad-btn ad-btn--small ad-btn--danger"
                onClick={() => handleRemove(a.email)}
              >
                Quitar
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
