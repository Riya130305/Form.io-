import React, { useState } from 'react';

const BUILDER_URL = 'https://formio.github.io/formio.js/app/builder';

const EXPORT_TIPS = [
  { step: '1', text: 'Drag any component (e.g. Text Field) from the left panel onto the canvas.' },
  { step: '2', text: 'Click the "JSON" tab at the very top of the builder page.' },
  { step: '3', text: 'Select all text (Ctrl+A / ⌘A), copy it, then come back here and paste.' },
];

const CreateFormButton: React.FC = () => {
  const [tipOpen, setTipOpen] = useState(false);

  const handleClick = () => {
    window.open(BUILDER_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="create-btn-wrapper">
      <div className="create-btn-row">
        <button id="btn-create-new-form" className="btn-create-form" onClick={handleClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Create New Form
          <span className="btn-create-form-badge">Opens in new tab ↗</span>
        </button>

        <button
          className="btn-toggle-tip"
          onClick={() => setTipOpen((o) => !o)}
          aria-expanded={tipOpen}
          title="How to export JSON from the builder"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          How to export JSON
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`tip-chevron ${tipOpen ? 'tip-chevron-open' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {tipOpen && (
        <div className="export-tip-panel" role="region" aria-label="Export JSON instructions">
          <p className="export-tip-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
            Steps to copy the JSON schema from the builder:
          </p>
          <ol className="export-tip-list">
            {EXPORT_TIPS.map((t) => (
              <li key={t.step} className="export-tip-item">
                <span className="export-tip-num">{t.step}</span>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
          <p className="export-tip-note">
            💡 The JSON tab shows the raw schema — that's exactly what you paste below.
          </p>
        </div>
      )}

      <p className="create-btn-hint">
        The Form.io visual builder opens in a new tab. Build your form there, export the JSON, then paste it in the section below.
      </p>
    </div>
  );
};

export default CreateFormButton;
