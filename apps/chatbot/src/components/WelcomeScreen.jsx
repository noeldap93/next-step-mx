import React from 'react';

/**
 * Shown before the user enters the chat. The first request to the chat
 * endpoint is already in flight (kicked off by useConversation on mount),
 * so by the time the user reads the welcome and clicks "Empezar" the first
 * assistant message is usually already buffered locally — making the chat
 * feel instant.
 */
export default function WelcomeScreen({ onStart, ready, error }) {
  return (
    <main className="gx-welcome">
      <div className="gx-welcome-eyebrow">conversación · 1 a 1</div>
      <h1 className="gx-welcome-title">Hablemos un momento.</h1>
      <p className="gx-welcome-body">
        Vamos a tener una conversación breve. Algunas preguntas te dejarán elegir
        entre opciones, otras serán de texto libre. No hay respuestas correctas
        — solo cuéntanos lo que pienses.
      </p>

      <button
        type="button"
        className="nl-btn nl-btn--primary nl-btn--big nl-btn--pulse gx-welcome-cta"
        onClick={onStart}
        disabled={!!error}
      >
        Empezar
        <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 7h16M11 1l6 6-6 6" />
        </svg>
      </button>

      <div className="gx-welcome-status">
        {error ? (
          <span className="gx-welcome-status--error">no pudimos preparar la conversación: {error}</span>
        ) : ready ? (
          <span className="gx-welcome-status--ready">listo · primer mensaje cargado</span>
        ) : (
          <span className="gx-welcome-status--pending">
            <span className="gx-pending-dots"><span /><span /><span /></span>
            preparando…
          </span>
        )}
      </div>
    </main>
  );
}
