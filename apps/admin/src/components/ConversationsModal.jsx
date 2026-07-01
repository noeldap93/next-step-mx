import React, { useEffect, useState, useCallback } from 'react';
import { listConversations, listMessages } from '../lib/admin.js';
import Markdown from './Markdown.jsx';

function fmtDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

export default function ConversationsModal({ user, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setConversations(await listConversations(user.id));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { refresh(); }, [refresh]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <header className="ad-modal-head">
          <div>
            <div className="ad-modal-eyebrow">conversaciones</div>
            <h2 className="ad-modal-title">{user.name || user.id}</h2>
            <div className="ad-modal-sub">{user.id}</div>
          </div>
          <button type="button" className="ad-btn ad-btn--small" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <div className="ad-modal-body">
          {error && <div className="ad-error">{error}</div>}
          {loading && <div className="ad-loading-inline">cargando…</div>}

          {!loading && conversations.length === 0 && (
            <div className="ad-empty">Este usuario no ha tenido conversaciones todavía.</div>
          )}

          <div className="ad-conv-list">
            {conversations.map((c) => (
              <ConversationRow
                key={c.id}
                userId={user.id}
                conversation={c}
                open={openId === c.id}
                onToggle={() => setOpenId(openId === c.id ? null : c.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationRow({ userId, conversation, open, onToggle }) {
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || messages !== null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listMessages(userId, conversation.id)
      .then((m) => { if (!cancelled) setMessages(m); })
      .catch((err) => { if (!cancelled) setError(err.message || String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, userId, conversation.id, messages]);

  return (
    <div className={`ad-conv ${open ? 'is-open' : ''}`}>
      <button type="button" className="ad-conv-head" onClick={onToggle}>
        <div className="ad-conv-head-left">
          <div className="ad-conv-time">{fmtDate(conversation.createdAt)}</div>
          <div className="ad-conv-id">{conversation.id}</div>
        </div>
        <div className="ad-conv-head-right">
          <span className={`ad-chip ${conversation.status === 'complete' ? 'ad-chip--muted' : 'ad-chip--accent'}`}>
            {conversation.status || 'active'}
          </span>
          <span className="ad-chip ad-chip--muted">
            {conversation.questionCount ?? 0} respuestas
          </span>
          <span className="ad-conv-caret" aria-hidden="true">{open ? '−' : '+'}</span>
        </div>
      </button>

      {open && (
        <div className="ad-conv-body">
          {loading && <div className="ad-loading-inline">cargando mensajes…</div>}
          {error && <div className="ad-error">{error}</div>}
          {!loading && !error && messages && messages.length === 0 && (
            <div className="ad-empty">(conversación vacía)</div>
          )}
          {messages && messages.map((m) => <MessageRow key={m.id} message={m} />)}
        </div>
      )}
    </div>
  );
}

function MessageRow({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`ad-msg ad-msg--${isUser ? 'user' : 'assistant'}`}>
      <div className="ad-msg-head">
        <span className="ad-msg-role">{isUser ? 'Usuario' : 'Asistente'}</span>
        {message.createdAt?.toDate && (
          <span className="ad-msg-time">{message.createdAt.toDate().toLocaleString()}</span>
        )}
      </div>

      {message.text && (
        isUser
          ? <div className="ad-msg-text">{message.text}</div>
          : <Markdown className="ad-msg-text ad-md">{message.text}</Markdown>
      )}

      {message.tool_use && (
        <ToolUseBlock toolUse={message.tool_use} />
      )}

      {message.user_response && (
        <UserResponseBlock response={message.user_response} toolUseId={message.tool_use_id} />
      )}
    </div>
  );
}

function ToolUseBlock({ toolUse }) {
  const input = toolUse.input || {};
  return (
    <div className="ad-msg-tool">
      <div className="ad-msg-tool-label">opciones presentadas</div>
      {input.question && (
        <Markdown className="ad-msg-tool-question ad-md">{input.question}</Markdown>
      )}
      <ul className="ad-msg-tool-options">
        {(input.options || []).map((opt) => (
          <li key={opt.id}>
            <code className="ad-msg-tool-id">{opt.id}</code>
            <span>{opt.label}</span>
            {opt.icon && <span className="ad-msg-tool-icon">{opt.icon}</span>}
          </li>
        ))}
      </ul>
      <div className="ad-msg-tool-meta">
        {input.multi_select && <span className="ad-chip ad-chip--muted">multi-select</span>}
        {input.include_other && <span className="ad-chip ad-chip--muted">+ otro</span>}
      </div>
    </div>
  );
}

function UserResponseBlock({ response }) {
  const { selected = [], other_text } = response || {};
  return (
    <div className="ad-msg-resp">
      {selected.length > 0 && (
        <div className="ad-msg-resp-line">
          <span className="ad-msg-resp-label">eligió</span>
          {selected.map((id) => <code key={id} className="ad-msg-tool-id">{id}</code>)}
        </div>
      )}
      {other_text && (
        <div className="ad-msg-resp-line">
          <span className="ad-msg-resp-label">otro</span>
          <span>{other_text}</span>
        </div>
      )}
    </div>
  );
}
