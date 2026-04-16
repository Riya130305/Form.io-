import React, { useState } from 'react';
import BuilderGuide from './BuilderGuide';
import CreateFormButton from './CreateFormButton';
import JsonInputBox from './JsonInputBox';
import PreviewForm from './PreviewForm';
import FinalSavedForm from './FinalSavedForm';
import { loginAdmin, saveFormSchema } from '../services/api';

/**
 * Normalize a raw schema pasted from the builder:
 * - Ensures title, name, path, type, display are set so Form.io accepts the POST /form request
 * - Adds unique timestamp suffix to name/path to avoid duplicates
 */
function normalizeSchema(raw: Record<string, unknown>): Record<string, unknown> {
  const title = (raw.title as string) || 'My Custom Form';
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 45) || 'mycustomform'; // Reduced to 45 to accommodate suffix
  
  // Add unique timestamp suffix to ensure name/path uniqueness
  const uniqueSuffix = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const uniqueName = `${slug}-${uniqueSuffix}`;
  const uniquePath = `${slug}-${uniqueSuffix}`;

  return {
    ...raw,
    title,
    name: (raw.name as string) || uniqueName,
    path: (raw.path as string) || uniquePath,
    type: (raw.type as string) || 'form',
    display: (raw.display as string) || 'form',
  };
}

const FormCreator: React.FC = () => {
  // JSON schema loaded from the textarea
  const [previewSchema, setPreviewSchema] = useState<Record<string, unknown> | null>(null);

  // ID of the form saved to the backend (triggers FinalSavedForm)
  const [savedFormId, setSavedFormId] = useState<string | null>(null);

  // Save flow state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cached admin JWT (held in state only, never persisted)
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const handleLoadPreview = (schema: Record<string, unknown>) => {
    setSavedFormId(null);
    setSaveSuccess(false);
    setSaveError(null);
    setPreviewSchema(schema);
  };

  const handleSaveForm = async () => {
    if (!previewSchema) return;
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Get or reuse cached admin token
      let token = adminToken;
      if (!token) {
        token = await loginAdmin();
        setAdminToken(token);
      }

      const normalized = normalizeSchema(previewSchema);
      const saved = await saveFormSchema(normalized, token);
      setSavedFormId(saved._id);
      setSaveSuccess(true);

      // Scroll to success
      setTimeout(() => {
        document.getElementById('save-success-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err: unknown) {
      setAdminToken(null);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSaveError(`Save failed: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreviewSchema(null);
    setSavedFormId(null);
    setSaveSuccess(false);
    setSaveError(null);
    setAdminToken(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="form-creator">
      {/* ── Step-by-step guide ────────────────────────────────── */}
      <BuilderGuide />

      {/* ── Open external builder ─────────────────────────────── */}
      <div className="creator-divider" />
      <CreateFormButton />

      {/* ── JSON input + validation ───────────────────────────── */}
      <div className="creator-divider" />
      <JsonInputBox onLoadPreview={handleLoadPreview} />

      {/* ── Preview (shown after Load Preview, before save) ───── */}
      {previewSchema && !savedFormId && (
        <>
          <div className="creator-divider" />
          <PreviewForm schema={previewSchema} />

          {/* Save controls */}
          <div className="save-controls">
            {saveError && (
              <div className="save-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {saveError}
              </div>
            )}
            <button
              id="btn-save-form"
              className="btn-save-form"
              onClick={handleSaveForm}
              disabled={isSaving}
              title="Save this form schema to MongoDB for future use"
            >
              {isSaving ? (
                <>
                  <div className="spinner spinner-sm" />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Form Schema to Backend
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* ── Success banner + Final form (shown after Save) ──────── */}
      {saveSuccess && savedFormId && (
        <>
          <div className="creator-divider" />
          <div id="save-success-anchor" className="save-success-banner" role="status">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div className="save-success-text">
              <strong>Form saved successfully!</strong>
              <span>Your form schema is now stored in MongoDB and ready to use.</span>
            </div>
            <button className="btn-create-another" onClick={handleReset} title="Start over with a new form">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Create Another
            </button>
          </div>
          <FinalSavedForm formId={savedFormId} />
        </>
      )}
    </div>
  );
};

export default FormCreator;
