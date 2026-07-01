import React, { useEffect, useRef } from 'react';
import Message from './Message.jsx';
import ChoicesInput from './ChoicesInput.jsx';
import TextInput from './TextInput.jsx';

export default function Chat({ conv }) {
  const bottomRef = useRef(null);

  // Scroll to the bottom whenever the message list grows, the pending state
  // flips, or the conversation length changes. We use scrollIntoView on a
  // sentinel so it works regardless of which ancestor is actually scrollable
  // (currently the body scrolls, not gx-chat-scroll). The double rAF gives
  // the browser one frame to lay out the new content before scrolling, so
  // we hit the latest scrollHeight instead of a stale one.
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [conv.messages.length, conv.pending, conv.complete]);

  const lastAssistant = [...conv.messages].reverse().find((m) => m.role === 'assistant');
  const lastIsAssistant = conv.messages[conv.messages.length - 1]?.role === 'assistant';
  const expectsChoices = lastIsAssistant && !!lastAssistant?.tool_use;

  return (
    <main className="gx-chat">
      <div className="gx-chat-scroll">
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

      {/* Sentinel for autoscroll. Sits at the very end of the chat layout so
          scrollIntoView always brings the latest content + input into view. */}
      <div ref={bottomRef} className="gx-bottom-sentinel" aria-hidden="true" />
    </main>
  );
}
