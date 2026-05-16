import React, { useEffect, useRef } from 'react';
import Message from './Message.jsx';
import ChoicesInput from './ChoicesInput.jsx';
import TextInput from './TextInput.jsx';

export default function Chat({ conv }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conv.messages.length, conv.pending]);

  const lastAssistant = [...conv.messages].reverse().find((m) => m.role === 'assistant');
  const lastIsAssistant = conv.messages[conv.messages.length - 1]?.role === 'assistant';
  const expectsChoices = lastIsAssistant && !!lastAssistant?.tool_use;

  return (
    <main className="gx-chat">
      <div className="gx-chat-scroll" ref={scrollRef}>
        <div className="gx-chat-inner">
          {conv.messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}

          {conv.pending && (
            <div className="gx-msg gx-msg--assistant gx-msg--pending">
              <div className="gx-msg-role">Asistente</div>
              <div className="gx-pending-dots"><span /><span /><span /></div>
            </div>
          )}

          {conv.error && (
            <div className="gx-error">
              <div className="gx-error-label">error</div>
              <div className="gx-error-msg">{conv.error}</div>
            </div>
          )}
        </div>
      </div>

      <div className="gx-input-area">
        {!conv.pending && lastIsAssistant && expectsChoices && (
          <ChoicesInput
            key={lastAssistant.id}
            toolInput={lastAssistant.tool_use.input}
            onSubmit={conv.submit}
            disabled={conv.pending}
          />
        )}

        {!conv.pending && lastIsAssistant && !expectsChoices && (
          <TextInput onSubmit={conv.submit} disabled={conv.pending} />
        )}
      </div>
    </main>
  );
}
