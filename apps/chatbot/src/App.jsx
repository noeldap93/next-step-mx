import React, { useEffect, useState, useCallback } from 'react';
import ParticleField from './components/ParticleField.jsx';
import Chat from './components/Chat.jsx';
import MissingUserId from './components/MissingUserId.jsx';
import EndScreen from './components/EndScreen.jsx';
import useUserId from './hooks/useUserId.js';
import useConversation from './hooks/useConversation.js';

function newConversationId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'c_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const userId = useUserId();
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    if (userId && !conversationId) setConversationId(newConversationId());
  }, [userId, conversationId]);

  const restart = useCallback(() => {
    setConversationId(newConversationId());
  }, []);

  if (!userId) {
    return (
      <div className="gx-shell">
        <ParticleField />
        <MissingUserId />
      </div>
    );
  }

  if (!conversationId) return null;

  return (
    <ConversationView
      key={conversationId}
      userId={userId}
      conversationId={conversationId}
      onRestart={restart}
    />
  );
}

function ConversationView({ userId, conversationId, onRestart }) {
  const conv = useConversation({ userId, conversationId });

  return (
    <div className="gx-shell">
      <ParticleField />
      <header className="gx-topbar">
        <div className="gx-mark">
          <span className="gx-mark-dot" />
          <span className="gx-mark-name">Chat</span>
        </div>
        <div className="gx-mark-sub">conversación · {conv.questionCount}/{conv.maxQuestions}</div>
      </header>

      {conv.complete ? (
        <EndScreen onRestart={onRestart} />
      ) : (
        <Chat conv={conv} />
      )}
    </div>
  );
}
