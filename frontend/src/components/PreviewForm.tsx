import React, { useEffect, useRef, useState } from 'react';
import { Formio } from 'formiojs';

interface PreviewFormProps {
  schema: Record<string, unknown>;
}

// Submission data: { fieldKey: fieldValue, submit: true, ... }
type SubmissionData = Record<string, unknown>;

const PreviewForm: React.FC<PreviewFormProps> = ({ schema }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [componentCount, setComponentCount] = useState<number | null>(null);

  // Captured submission data when user hits Submit in the preview
  const [submittedData, setSubmittedData] = useState<SubmissionData | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    setIsRendering(true);
    setRenderError(null);
    setComponentCount(null);
    setSubmittedData(null);
    mountRef.current.innerHTML = '';

    let formInstance: { destroy?: () => void; on?: (event: string, cb: (payload: { data: SubmissionData }) => void) => void } | null = null;
    let cancelled = false;

    Formio.createForm(mountRef.current, schema, { noAlerts: true })
      .then((form) => {
        if (cancelled) { form.destroy?.(); return; }
        formInstance = form;

        // ── Listen for form submission ───────────────────────────
        form.on('submit', (submission: { data: SubmissionData }) => {
          // submission.data contains { fieldKey: value, ... }
          setSubmittedData(submission.data);
          form.emit('submitDone');           // tell Formio the submit is handled
        });

        const comps = Array.isArray(schema.components)
          ? (schema.components as Record<string, unknown>[]) : [];
        const count = comps.filter((c) => c.type !== 'button' && c.key !== 'submit').length;
        setComponentCount(count);
        setIsRendering(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRenderError(err instanceof Error ? err.message : String(err));
          setIsRendering(false);
        }
      });

    return () => {
      cancelled = true;
      formInstance?.destroy?.();
    };
  }, [schema]);

  // Strip the "submit" key and show only real field data
  const displayData = submittedData
    ? Object.entries(submittedData).filter(([k]) => k !== 'submit')
    : null;

  return (
    <div className="preview-section" id="preview-anchor">
      <div className="preview-section-header">
        <div className="preview-section-header-row">
          <span className="json-section-badge preview-badge">Step 5 — Preview</span>
          {componentCount !== null && (
            <span className="component-count-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              {componentCount} field{componentCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <h3 className="json-section-title">Form Preview</h3>
        <p className="json-section-hint">
          Live local preview — <strong>not yet saved</strong> to the backend.
          Fill it in and click Submit to see the captured data below.
        </p>
      </div>

      {isRendering && (
        <div className="preview-loading">
          <div className="spinner spinner-sm" />
          <span>Rendering form…</span>
        </div>
      )}
      {renderError && (
        <p className="preview-render-error">
          ⚠️ Failed to render: {renderError}. Please verify your schema.
        </p>
      )}

      {/* Formio mount target — React must NOT render children here */}
      <div
        className="preview-form-container form-wrapper"
        ref={mountRef}
        style={{ display: isRendering && !renderError ? 'none' : undefined }}
      />

      {/* ── Submitted Data Panel ───────────────────────────────── */}
      {displayData && (
        <div className="submitted-data-panel">
          <div className="submitted-data-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <strong>Form Submitted — Captured Data</strong>
            <button
              className="btn-clear-submission"
              onClick={() => setSubmittedData(null)}
              title="Clear submission result"
            >
              ✕
            </button>
          </div>
          <p className="submitted-data-hint">
            These are the <code>key → value</code> pairs from the form submission.
            After saving the form, this same data shape gets POSTed to <code>/form/:id/submission</code>.
          </p>

          <table className="submitted-data-table">
            <thead>
              <tr>
                <th>Field Key</th>
                <th>Value</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr><td colSpan={3} className="no-data-cell">No field data captured.</td></tr>
              ) : (
                displayData.map(([key, value]) => (
                  <tr key={key}>
                    <td><code className="data-key">{key}</code></td>
                    <td className="data-value">
                      {value === '' || value === null || value === undefined
                        ? <span className="data-empty">(empty)</span>
                        : String(value)}
                    </td>
                    <td><span className="data-type">{typeof value}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <details className="raw-json-details">
            <summary>View raw JSON</summary>
            <pre className="raw-json-pre">{JSON.stringify(submittedData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default PreviewForm;
