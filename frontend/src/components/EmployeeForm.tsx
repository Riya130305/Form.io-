import React, { useEffect, useState, useCallback } from 'react';
import { Form } from '@formio/react';
import { toast } from 'react-toastify';
import { getFormSchema, submitForm, FormSubmissionData } from '../services/api';

interface EmployeeFormProps {
  onSubmitSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmitSuccess }) => {
  // Form ka JSON store hoga yaha
  const [formSchema, setFormSchema] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Load Form Schema from Backend ─────────────────────────────────────────
  const loadSchema = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      await submitForm(submission.data);
      toast.success('🎉 Employee details submitted successfully!', {
        position: 'top-right',
        autoClose: 4000,
      });
      onSubmitSuccess();
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

  return (
    <div className={`form-wrapper ${submitting ? 'form-submitting' : ''}`}>
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
