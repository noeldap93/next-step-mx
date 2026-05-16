import React, { useState, useRef, useEffect } from 'react';

export default function TextInput({ onSubmit, disabled, placeholder = 'Escribe tu respuesta…' }) {
  const [value, setValue] = useState('');
  const taRef = useRef(null);

  useEffect(() => {
    if (!disabled && taRef.current) taRef.current.focus();
  }, [disabled]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    onSubmit({ text: trimmed });
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="gx-textinput">
      <textarea
        ref={taRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        className="nl-btn nl-btn--primary gx-textinput-send"
        onClick={submit}
        disabled={disabled || !value.trim()}
      >
        Enviar
        <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 7h16M11 1l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
