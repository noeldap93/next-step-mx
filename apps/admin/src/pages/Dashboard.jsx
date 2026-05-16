import React, { useState } from 'react';
import { signOut } from '../lib/firebase.js';
import UsersPage from './UsersPage.jsx';
import PromptsPage from './PromptsPage.jsx';
import AdminsPage from './AdminsPage.jsx';

const TABS = [
  { id: 'users', label: 'Usuarios' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'admins', label: 'Admins' },
];

export default function Dashboard({ user }) {
  const [tab, setTab] = useState('users');

  return (
    <div className="ad-shell">
      <header className="ad-header">
        <div className="ad-header-left">
          <div className="ad-mark">
            <span className="ad-mark-dot" />
            <span>Next Step</span>
            <span className="ad-mark-sub">admin</span>
          </div>
          <nav className="ad-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`ad-tab ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="ad-header-right">
          <span className="ad-user">{user.email}</span>
          <button type="button" className="ad-btn ad-btn--small" onClick={() => signOut()}>
            Salir
          </button>
        </div>
      </header>

      <main className="ad-main">
        {tab === 'users' && <UsersPage user={user} />}
        {tab === 'prompts' && <PromptsPage user={user} />}
        {tab === 'admins' && <AdminsPage user={user} />}
      </main>
    </div>
  );
}
