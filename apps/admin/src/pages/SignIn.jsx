import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase.js';

export default function SignIn() {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setPending(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || String(err));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="ad-signin">
      <div className="ad-eyebrow">next step · admin</div>
      <h1 className="ad-display">Inicia sesión</h1>
      <p className="ad-sub">
        Acceso restringido. Inicia sesión con tu cuenta de Google asociada a esta organización.
      </p>
      <button
        type="button"
        className="ad-btn ad-btn--primary ad-btn--big"
        onClick={handleSignIn}
        disabled={pending}
      >
        {pending ? 'Conectando…' : 'Iniciar sesión con Google'}
      </button>
      {error && <div className="ad-error">{error}</div>}
    </main>
  );
}
