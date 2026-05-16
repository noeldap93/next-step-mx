import React, { useEffect, useState } from 'react';
import { watchAuth } from './lib/firebase.js';
import { isAdmin } from './lib/admin.js';
import SignIn from './pages/SignIn.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [authState, setAuthState] = useState({ loading: true, user: null, admin: false });

  useEffect(() => {
    const unsub = watchAuth(async (user) => {
      if (!user) {
        setAuthState({ loading: false, user: null, admin: false });
        return;
      }
      setAuthState({ loading: true, user, admin: false });
      const admin = await isAdmin(user);
      setAuthState({ loading: false, user, admin });
    });
    return unsub;
  }, []);

  if (authState.loading) {
    return (
      <div className="ad-loading">
        <div className="ad-loading-dot" />
      </div>
    );
  }

  if (!authState.user) return <SignIn />;
  if (!authState.admin) return <Unauthorized user={authState.user} />;
  return <Dashboard user={authState.user} />;
}
