import React from 'react';
import Markdown from './Markdown.jsx';

export default function Message({ message }) {
  const isUser = message.role === 'user';

  // Assistant text and tool_use questions may contain markdown (bold,
  // italics, lists, etc.). User content is always plain text.
  let body = null;
  if (isUser) {
    if (message.text) {
      body = <p className="gx-msg-text">{message.text}</p>;
    } else if (message.user_response) {
      const { selected, other_text } = message.user_response;
      const parts = [];
      if (selected && selected.length) parts.push(selected.join(' · '));
      if (other_text) parts.push(other_text);
      body = <p className="gx-msg-text">{parts.join(' — ')}</p>;
    }
  } else {
    const text = message.text || message.tool_use?.input?.question || null;
    if (text) {
      body = <Markdown className="gx-msg-text gx-md">{text}</Markdown>;
    }
  }

  return (
    <div className={`gx-msg gx-msg--${isUser ? 'user' : 'assistant'}`}>
      <div className="gx-msg-role">{isUser ? 'Tú' : 'Asistente'}</div>
      {body}
    </div>
  );
}
