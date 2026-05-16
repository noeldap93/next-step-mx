import React, { useState } from 'react';
import { iconByName } from './Icons.jsx';

const OTHER_ID = '__other__';

export default function ChoicesInput({ toolInput, onSubmit, disabled }) {
  const {
    options = [],
    multi_select: multiSelect = false,
    include_other: includeOther = false,
  } = toolInput || {};

  const [selected, setSelected] = useState(() => new Set());
  const [otherText, setOtherText] = useState('');

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (multiSelect) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const selectedArr = Array.from(selected);
    const wantsOther = selectedArr.includes(OTHER_ID);
    const trimmedOther = otherText.trim();

    if (wantsOther && !trimmedOther) return;
    if (selectedArr.length === 0 && !trimmedOther) return;

    const cleanSelected = selectedArr.filter((id) => id !== OTHER_ID);
    onSubmit({
      selected: cleanSelected,
      other_text: wantsOther ? trimmedOther : null,
    });
  };

  const submitDisabled =
    disabled ||
    (selected.size === 0 && !otherText.trim()) ||
    (selected.has(OTHER_ID) && !otherText.trim());

  const otherSelected = selected.has(OTHER_ID);

  return (
    <div className="gx-choices-shell">
      <div className="gx-choices">
        {options.map((opt) => {
          const Icon = iconByName(opt.icon);
          const isSel = selected.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              className={`gx-choice ${isSel ? 'is-selected' : ''}`}
              onClick={() => toggle(opt.id)}
              disabled={disabled}
            >
              {Icon && (
                <span className="gx-choice-icon"><Icon /></span>
              )}
              <span className="gx-choice-label">{opt.label}</span>
            </button>
          );
        })}

        {includeOther && (
          <button
            type="button"
            className={`gx-choice gx-choice--other ${otherSelected ? 'is-selected' : ''}`}
            onClick={() => toggle(OTHER_ID)}
            disabled={disabled}
          >
            <span className="gx-choice-label">Otro</span>
          </button>
        )}
      </div>

      {includeOther && otherSelected && (
        <div className="gx-other-input">
          <input
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Cuéntanos…"
            autoFocus
            disabled={disabled}
            onKeyDown={(e) => { if (e.key === 'Enter' && !submitDisabled) handleSubmit(); }}
          />
        </div>
      )}

      <div className="gx-choices-actions">
        <span className="gx-choices-mode">
          {multiSelect ? 'selección múltiple' : 'selecciona una opción'}
        </span>
        <button
          type="button"
          className="nl-btn gx-submit"
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          Enviar
          <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 7h16M11 1l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
