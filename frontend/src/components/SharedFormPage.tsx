import React, { useEffect, useState } from 'react';
import { Form } from '@formio/react';
import { toast } from 'react-toastify';
import { getFormById, submitForm, FormSubmissionData } from '../services/api';

interface SharedFormPageProps {
  formId: string;
  onClose: () => void;
}

const SharedFormPage: React.FC<SharedFormPageProps> = ({ formId, onClose }) => {
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!formId) {
      setError('No form ID provided');
      setLoading(false);
      return;
    }

    const fetchForm = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFormById(formId);
        console.log('Form loaded:', data);
        setSchema(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to load shared form:', err);
        setError(`Failed to load form: ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleSubmit = async (submission: { data: FormSubmissionData }) => {
    try {
      setSubmitting(true);
      // Get the form path from the schema to submit to the correct endpoint
      const formPath = schema?.path as string | undefined;
      // For shared forms, submit as public (isPublic = true)
      await submitForm(submission.data, formPath, true);
      toast.success('✅ Form submitted successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
      
      // Show thank you message instead of redirecting
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Submit failed:', err);
      toast.error(`Submission failed: ${msg}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="shared-form-page">
        <div className="form-loading">
          <div className="spinner" />
          <p>Loading form…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-form-page">
        <div className="form-error">
          <div className="error-icon">⚠️</div>
          <h3>Form Not Found</h3>
          <p>{error}</p>
          <button className="btn-back-home" onClick={onClose}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const formTitle = schema?.title as string | undefined;

  // ─── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="shared-form-page">
        <div className="shared-form-container">
          <div className="success-screen">
            <div className="success-card">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 className="success-title">Thanks for filling out this form!</h2>
              <p className="success-subtitle">Your response has been recorded.</p>
              <button className="btn-submit-another" onClick={handleSubmitAnother}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Submit another response
              </button>
              <button className="btn-back-home-from-success" onClick={onClose}>
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-form-page">
      <div className="shared-form-container">
        <div className="shared-form-header">
          <button
            className="btn-back-home-header"
            onClick={onClose}
            title="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <h1 className="shared-form-title">{formTitle || 'Form'}</h1>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Important Fields Instruction Banner */}
          <div className="form-instruction-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <strong>Important:</strong> Name and Email are essential fields to record your data. Please fill these fields carefully.
            </div>
          </div>

          {submitting && (
            <div className="submit-overlay">
              <div className="spinner" />
              <p>Submitting…</p>
            </div>
          )}

          {schema ? (
            <div className="shared-form-wrapper">
              <Form
                form={schema}
                onSubmit={handleSubmit}
                options={{
                  noAlerts: true,
                }}
              />
            </div>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Unable to render form - schema is missing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedFormPage;
