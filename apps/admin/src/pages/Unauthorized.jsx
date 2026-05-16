import React from 'react';
import { signOut } from '../lib/firebase.js';

export default function Unauthorized({ user }) {
  return (
    <main className="ad-signin">
      <div className="ad-eyebrow">acceso denegado</div>
      <h1 className="ad-display">No autorizado</h1>
      <p className="ad-sub">
        La cuenta <strong>{user.email}</strong> no tiene permisos de administrador.
        Si crees que esto es un error, contacta a otro administrador para que te dé acceso.
      </p>
      <button
        type="button"
        className="ad-btn"
        onClick={() => signOut()}
      >
        Cerrar sesión
      </button>
    </main>
  );
}
