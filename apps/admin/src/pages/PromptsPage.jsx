import React, { useEffect, useState, useCallback } from 'react';
import { listPrompts, upsertPrompt, deletePrompt } from '../lib/admin.js';

export default function PromptsPage({ user: currentUser }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPrompts(await listPrompts());
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSave = async (payload) => {
    await upsertPrompt({ ...payload, createdBy: currentUser.uid });
    setShowCreate(false);
    setEditingId(null);
    await refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm(`¿Eliminar prompt "${id}"? Los usuarios que lo usen quedarán sin prompt y la Cloud Function devolverá error.`)) return;
    await deletePrompt(id);
    await refresh();
  };

  return (
    <section className="ad-section">
      <div className="ad-section-head">
        <h2 className="ad-section-title">Prompts</h2>
        <button
          type="button"
          className="ad-btn ad-btn--primary"
          onClick={() => { setShowCreate((v) => !v); setEditingId(null); }}
        >
          {showCreate ? 'Cancelar' : 'Nuevo prompt'}
        </button>
      </div>

      {showCreate && (
        <PromptForm onSubmit={handleSave} onCancel={() => setShowCreate(false)} />
      )}

      {error && <div className="ad-error">{error}</div>}
      {loading && <div className="ad-loading-inline">cargando…</div>}

      {!loading && prompts.length === 0 && (
        <div className="ad-empty">No hay prompts todavía. Crea el primero.</div>
      )}

      <div className="ad-list">
        {prompts.map((p) => {
          const isEditing = editingId === p.id;
          return (
            <div key={p.id} className="ad-card">
              {!isEditing ? (
                <>
                  <div className="ad-card-head">
                    <div className="ad-card-id">{p.id}</div>
                    <div className="ad-card-title">{p.name || p.id}</div>
                  </div>
                  {p.description && <p className="ad-card-body">{p.description}</p>}
                  <pre className="ad-prompt-preview">{(p.content || '').slice(0, 400)}{(p.content || '').length > 400 ? '…' : ''}</pre>
                  <div className="ad-card-actions">
                    <button type="button" className="ad-btn ad-btn--small" onClick={() => { setEditingId(p.id); setShowCreate(false); }}>
                      Editar
                    </button>
                    <button type="button" className="ad-btn ad-btn--small ad-btn--danger" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </button>
                  </div>
                </>
              ) : (
                <PromptForm
                  initial={p}
                  editing
                  onSubmit={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PromptForm({ initial, editing, onSubmit, onCancel }) {
  const [id, setId] = useState(initial?.id || '');
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [content, setContent] = useState(initial?.content || '');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await onSubmit({
        id: id.trim(),
        name: name.trim(),
        description: description.trim(),
        content,
      });
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ad-form" onSubmit={submit}>
      <label className="ad-field">
        <span className="ad-label">ID</span>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="prompt-default"
          disabled={editing}
          required
        />
      </label>
      <label className="ad-field">
        <span className="ad-label">Nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entrevista — v1"
        />
      </label>
      <label className="ad-field">
        <span className="ad-label">Descripción (opcional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="¿Para qué se usa este prompt?"
        />
      </label>
      <label className="ad-field">
        <span className="ad-label">Contenido (system prompt)</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          placeholder="Eres un agente conversacional…"
          required
          className="ad-prompt-textarea"
        />
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
