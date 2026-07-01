import React, { useEffect, useState, useCallback } from 'react';
import {
  listUsers, createUser, updateUser, deleteUser, listPrompts,
} from '../lib/admin.js';
import ConversationsModal from '../components/ConversationsModal.jsx';

const CHATBOT_PATH = '/chat/';

function chatbotLink(userId) {
  const origin = import.meta.env.VITE_CHATBOT_ORIGIN || window.location.origin;
  return `${origin}${CHATBOT_PATH}?user_id=${encodeURIComponent(userId)}`;
}

export default function UsersPage({ user: currentUser }) {
  const [users, setUsers] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, p] = await Promise.all([listUsers(), listPrompts()]);
      setUsers(u);
      setPrompts(p);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async (payload) => {
    await createUser({ ...payload, createdBy: currentUser.uid });
    setShowCreate(false);
    await refresh();
  };

  const handleUpdate = async (id, patch) => {
    await updateUser(id, patch);
    setEditingId(null);
    await refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm(`¿Eliminar usuario "${id}"? Se borrará el documento del usuario pero NO sus conversaciones.`)) return;
    await deleteUser(id);
    await refresh();
  };

  return (
    <section className="ad-section">
      <div className="ad-section-head">
        <h2 className="ad-section-title">Usuarios</h2>
        <button
          type="button"
          className="ad-btn ad-btn--primary"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? 'Cancelar' : 'Nuevo usuario'}
        </button>
      </div>

      {showCreate && (
        <UserForm prompts={prompts} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      )}

      {error && <div className="ad-error">{error}</div>}
      {loading && <div className="ad-loading-inline">cargando…</div>}

      {!loading && users.length === 0 && (
        <div className="ad-empty">No hay usuarios todavía.</div>
      )}

      <div className="ad-list">
        {users.map((u) => {
          const prompt = prompts.find((p) => p.id === u.promptId);
          const isEditing = editingId === u.id;
          return (
            <div key={u.id} className="ad-card">
              {!isEditing ? (
                <>
                  <div className="ad-card-head">
                    <div className="ad-card-id">{u.id}</div>
                    {u.name && <div className="ad-card-title">{u.name}</div>}
                  </div>
                  <div className="ad-card-meta">
                    <span className="ad-chip">
                      prompt: {prompt ? (prompt.name || prompt.id) : (u.promptId || '— sin asignar —')}
                    </span>
                    {u.createdAt?.toDate && (
                      <span className="ad-chip ad-chip--muted">
                        creado: {u.createdAt.toDate().toLocaleString()}
                      </span>
                    )}
                  </div>
                  {u.note && <p className="ad-card-body">{u.note}</p>}
                  <div className="ad-card-actions">
                    <CopyLinkButton link={chatbotLink(u.id)} />
                    <button type="button" className="ad-btn ad-btn--small" onClick={() => setViewingUser(u)}>
                      Conversaciones
                    </button>
                    <button type="button" className="ad-btn ad-btn--small" onClick={() => setEditingId(u.id)}>
                      Editar
                    </button>
                    <button type="button" className="ad-btn ad-btn--small ad-btn--danger" onClick={() => handleDelete(u.id)}>
                      Eliminar
                    </button>
                  </div>
                </>
              ) : (
                <UserForm
                  initial={u}
                  prompts={prompts}
                  onSubmit={(patch) => handleUpdate(u.id, patch)}
                  onCancel={() => setEditingId(null)}
                  editing
                />
              )}
            </div>
          );
        })}
      </div>

      {viewingUser && (
        <ConversationsModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}
    </section>
  );
}

function UserForm({ initial, prompts, onSubmit, onCancel, editing }) {
  const [id, setId] = useState(initial?.id || '');
  const [name, setName] = useState(initial?.name || '');
  const [promptId, setPromptId] = useState(initial?.promptId || '');
  const [note, setNote] = useState(initial?.note || '');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const payload = { name: name.trim() || null, promptId: promptId || null, note: note.trim() || null };
      if (!editing) payload.id = id.trim() || undefined;
      await onSubmit(payload);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ad-form" onSubmit={submit}>
      {!editing && (
        <label className="ad-field">
          <span className="ad-label">ID (opcional — se genera uno si lo dejas vacío)</span>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} placeholder="u_abc123" />
        </label>
      )}
      <label className="ad-field">
        <span className="ad-label">Nombre / etiqueta</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente o campaña" />
      </label>
      <label className="ad-field">
        <span className="ad-label">Prompt asignado</span>
        <select value={promptId} onChange={(e) => setPromptId(e.target.value)}>
          <option value="">— sin asignar —</option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>{p.name || p.id}</option>
          ))}
        </select>
      </label>
      <label className="ad-field">
        <span className="ad-label">Nota interna (opcional)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Cualquier nota interna." />
      </label>
      {err && <div className="ad-error">{err}</div>}
      <div className="ad-form-actions">
        <button type="button" className="ad-btn" onClick={onCancel} disabled={submitting}>Cancelar</button>
        <button type="submit" className="ad-btn ad-btn--primary" disabled={submitting}>
          {submitting ? 'Guardando…' : (editing ? 'Guardar' : 'Crear')}
        </button>
      </div>
    </form>
  );
}

function CopyLinkButton({ link }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // ignore
    }
  };
  return (
    <button type="button" className="ad-btn ad-btn--small" onClick={copy} title={link}>
      {copied ? '✓ copiado' : 'Copiar enlace'}
    </button>
  );
}
