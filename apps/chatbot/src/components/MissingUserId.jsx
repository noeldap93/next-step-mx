import React from 'react';

export default function MissingUserId() {
  return (
    <main className="gx-missing">
      <div className="gx-missing-eyebrow">acceso requerido</div>
      <h1 className="gx-missing-title">Falta tu enlace personal</h1>
      <p className="gx-missing-body">
        Esta conversación se abre con un enlace personal que incluye tu identificador.
        Si recibiste un enlace, ábrelo desde ahí. Si crees que esto es un error,
        cierra esta ventana y vuelve a intentarlo.
      </p>
      <div className="gx-missing-hint">
        ?user_id=<span className="gx-missing-placeholder">tu_id</span>
      </div>
    </main>
  );
}
