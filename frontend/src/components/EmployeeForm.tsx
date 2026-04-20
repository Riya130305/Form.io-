import React, { useEffect, useState, useCallback } from 'react';
import { Form } from '@formio/react';
import { toast } from 'react-toastify';
import { getFormSchema, submitForm, FormSubmissionData } from '../services/api';

interface EmployeeFormProps {
  onSubmitSuccess?: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = () => {
  // Form ka JSON store hoga yaha
  const [formSchema, setFormSchema] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formPath, setFormPath] = useState<string | null>(null);

  // ─── Load Form Schema from Backend ─────────────────────────────────────────
  const loadSchema = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get form path from localStorage (created form path)
      const savedFormPath = localStorage.getItem('lastCreatedFormPath');
      setFormPath(savedFormPath);
      
      const schema = await getFormSchema();
      setFormSchema(schema);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to load form schema:', err);
      setError(
        'Could not connect to the Form.io backend.\n' +
        'Make sure:\n' +
        '  1. MongoDB is running\n' +
        '  2. Backend is running: cd backend && node index.js\n' +
        '  3. Seed script ran: node seed/createForm.js\n\n' +
        `Error: ${msg}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  // ─── Handle Submission ──────────────────────────────────────────────────────
  // Form.io calls onSubmit with { data: { ...formValues } }
  const handleSubmit = async (submission: { data: FormSubmissionData }) => {
    try {
      setSubmitting(true);
      console.log('Form submitted with data:', submission.data);
      
      // Get the form path from localStorage
      const savedFormPath = localStorage.getItem('lastCreatedFormPath');
      
      // Submit to the created form path, not the default one
      await submitForm(submission.data, savedFormPath || undefined);
      
      console.log('Submission successful, showing success screen');
      toast.success('🎉 Employee details submitted successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
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

  // ─── Handle Submit Another Response ──────────────────────────────────────────
  const handleSubmitAnother = () => {
    setSubmitted(false);
    // Reset the form by reloading schema
    setFormSchema(null);
    setError(null);
    setLoading(true);
    loadSchema();
  };

  // ─── Render States ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="form-loading">
        <div className="spinner" />
        <p>Loading form schema from backend…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error">
        <div className="error-icon">⚠️</div>
        <h3>Backend Connection Error</h3>
        <pre>{error}</pre>
        <button className="btn-retry" onClick={loadSchema}>
          🔄 Retry
        </button>
      </div>
    );
  }

  // ─── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
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
        </div>
      </div>
    );
  }

  // ─── Form View ──────────────────────────────────────────────────────────────
  return (
    <div className={`form-wrapper ${submitting ? 'form-submitting' : ''}`}>
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
      {formSchema && (
        <Form
          form={formSchema}
          onSubmit={handleSubmit}
          options={{
            noAlerts: true,
          }}
        />
      )}
    </div>
  );
};

export default EmployeeForm;
