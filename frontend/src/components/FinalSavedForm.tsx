import React, { useEffect, useState, useCallback } from 'react';
import { Form } from '@formio/react';
import { getFormById } from '../services/api';

interface FinalSavedFormProps {
  formId: string;
}

const FinalSavedForm: React.FC<FinalSavedFormProps> = ({ formId }) => {
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchSchema = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFormById(formId);
      setSchema(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load saved form: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(formId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareForm = () => {
    // Generate shareable URL with form ID as query parameter
    const shareUrl = `${window.location.origin}?view=shared&formId=${formId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      
      // Open in new tab
      window.open(shareUrl, '_blank');
    }).catch(() => {
      // If copy fails, just open in new tab
      window.open(shareUrl, '_blank');
    });
  };

  if (loading) {
    return (
      <div className="final-form-section">
        <div className="form-loading">
          <div className="spinner" />
          <p>Loading saved form from backend…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="final-form-section">
        <div className="form-error">
          <div className="error-icon">⚠️</div>
          <h3>Could Not Load Form</h3>
          <pre>{error}</pre>
          <button className="btn-retry" onClick={fetchSchema}>🔄 Retry</button>
        </div>
      </div>
    );
  }

  const formTitle = schema?.title as string | undefined;
  const formPath = schema?.path as string | undefined;

  return (
    <div className="final-form-section">
      <div className="preview-section-header">
        <div className="preview-section-header-row">
          <span className="json-section-badge final-badge">✅ Saved to MongoDB</span>
          <div className="button-group">
            <button
              className={`btn-copy-id ${copied ? 'btn-copy-id-success' : ''}`}
              onClick={handleCopyId}
              title="Copy form ID to clipboard"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy Form ID
                </>
              )}
            </button>
            <button
              className={`btn-share ${linkCopied ? 'btn-share-success' : ''}`}
              onClick={handleShareForm}
              title="Share form with others in a new tab"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {linkCopied ? 'Link Copied!' : 'Share Form'}
            </button>
          </div>
        </div>

        <h3 className="json-section-title">
          {formTitle || 'Your Form'} — Ready to Use
        </h3>

        <div className="final-form-meta">
          {formPath && (
            <span className="final-form-meta-item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              /{formPath}
            </span>
          )}
          <span className="final-form-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            ID: <code className="form-id-code">{formId.slice(-8)}…</code>
          </span>
        </div>

        <p className="json-section-hint">
          This form is now stored in MongoDB and rendered directly from the backend.
        </p>
      </div>

      {schema && (
        <div className="form-wrapper final-form-wrapper">
          <Form form={schema} options={{ noAlerts: true }} />
        </div>
      )}
    </div>
  );
};

export default FinalSavedForm;
