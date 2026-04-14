import React, { useState } from 'react';

interface JsonInputBoxProps {
  onLoadPreview: (schema: Record<string, unknown>) => void;
}

const JsonInputBox: React.FC<JsonInputBoxProps> = ({ onLoadPreview }) => {
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const lineCount = jsonText ? jsonText.split('\n').length : 0;
  const charCount = jsonText.length;

  const handleLoadPreview = () => {
    setJsonError(null);

    if (!jsonText.trim()) {
      setJsonError('Please paste a Form.io JSON schema before loading the preview.');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setJsonError('Invalid JSON — please check your schema for syntax errors (missing comma, bracket, or quote).');
      return;
    }

    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
      setJsonError('Invalid schema: expected a JSON object at the root (e.g. { "components": [...] }).');
      return;
    }

    const schema = parsed as Record<string, unknown>;

    if (!Array.isArray(schema.components)) {
      setJsonError(
        'Schema is missing a "components" array. In the builder, make sure you\'ve added at least one field, then re-export the JSON.'
      );
      return;
    }

    onLoadPreview(schema);

    // Scroll to preview section
    setTimeout(() => {
      document.getElementById('preview-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="json-input-section">
      <div className="json-input-header">
        <div className="json-input-label-row">
          <span className="json-section-badge">Step 4</span>
          <h3 className="json-section-title">Paste Your JSON Schema</h3>
        </div>
        <p className="json-section-hint">
          In the Form.io Builder, click the <strong>JSON</strong> tab, select all, copy, and paste the full schema here.
        </p>
      </div>

      <div className="json-textarea-wrapper">
        <textarea
          id="json-schema-textarea"
          className={`json-textarea${jsonError ? ' json-textarea-error' : ''}`}
          placeholder={`{\n  "title": "My Form",\n  "name": "myform",\n  "path": "myform",\n  "type": "form",\n  "display": "form",\n  "components": [...]\n}`}
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            if (jsonError) setJsonError(null);
          }}
          rows={12}
          spellCheck={false}
        />
        {jsonText && (
          <div className="json-meta-bar">
            <span className="json-meta-stat">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="21" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="21" y1="18" x2="3" y2="18"/>
              </svg>
              {lineCount} lines
            </span>
            <span className="json-meta-stat">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
              {charCount.toLocaleString()} chars
            </span>
          </div>
        )}
      </div>

      {jsonError && (
        <div className="json-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {jsonError}
        </div>
      )}

      <div className="json-actions">
        <button
          id="btn-load-preview"
          className="btn-load-preview"
          onClick={handleLoadPreview}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Load Preview
        </button>
        {jsonText && (
          <button
            className="btn-clear-json"
            onClick={() => { setJsonText(''); setJsonError(null); }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default JsonInputBox;
