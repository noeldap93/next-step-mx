import React from 'react';

export default function EndScreen({ onRestart }) {
  return (
    <main className="gx-end">
      <div className="gx-end-eyebrow">conversación finalizada</div>
      <h1 className="gx-end-title">Gracias por tu tiempo.</h1>
      <p className="gx-end-body">
        Hemos terminado esta conversación. Si quieres explorar otra ruta o
        cambiar tus respuestas, puedes iniciar una conversación nueva.
      </p>
      <button
        type="button"
        className="nl-btn nl-btn--primary nl-btn--big nl-btn--pulse"
        onClick={onRestart}
      >
        Conversar otra vez
      </button>
    </main>
  );
}
