import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmployeeForm from './components/EmployeeForm';
import LandingPage from './components/LandingPage';
import FormCreator from './components/FormCreator';
import SharedFormPage from './components/SharedFormPage';
import SubmissionsList from './components/SubmissionsList';

type View = 'landing' | 'form' | 'create' | 'shared' | 'submissions';

// Helper function to get initial view and formId from URL
function getInitialViewState(): { view: View; formId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  const formIdParam = params.get('formId');

  if (viewParam === 'shared' && formIdParam) {
    return { view: 'shared', formId: formIdParam };
  }

  return { view: 'landing', formId: null };
}

const App: React.FC = () => {
  const initialState = getInitialViewState();
  const [view, setView] = useState<View>(initialState.view);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(initialState.formId);

  const handleSubmitSuccess = () => {
    // Submit success handler - can be extended for future use
  };

  // ── Landing Page ─────────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <>
        <LandingPage
          onStartForm={() => setView('create')}
          onViewSubmissions={() => setView('submissions')}
        />
        <ToastContainer theme="light" />
      </>
    );
  }

  // ── Shared Form Page ──────────────────────────────────────────────────────
  if (view === 'shared' && selectedFormId) {
    return (
      <>
        <SharedFormPage
          formId={selectedFormId}
          onClose={() => {
            setSelectedFormId(null);
            setView('landing');
          }}
        />
        <ToastContainer theme="light" />
      </>
    );
  }

  // ── Form / Submissions views ──────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo">
            <button className="logo-back-btn" onClick={() => setView('landing')} title="Back to home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <div className="logo-icon">⚡</div>
            <div className="header-text">
              <h1>Form<span>.io</span> POC</h1>
              <p className="header-subtitle">Employee Onboarding System</p>
            </div>
          </div>
          <div className="header-badges">
            <span className="tech-badge">React + TS</span>
            <span className="tech-badge">Form.io</span>
            <span className="tech-badge">MongoDB</span>
          </div>
        </div>
        {/* ── Architecture Banner ──────────────────────────────────────── */}
        <div className="arch-banner">
          <span className="arch-step">🖥️ React Frontend</span>
          <span className="arch-arrow">→</span>
          <span className="arch-step">⚙️ Form.io Server</span>
          <span className="arch-arrow">→</span>
          <span className="arch-step">🗄️ MongoDB</span>
        </div>
      </header>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <nav className="tab-nav">
        <button
          id="tab-create"
          className={`tab-btn ${view === 'create' ? 'tab-active' : ''}`}
          onClick={() => setView('create')}
        >
          <span className="tab-icon">🛠️</span>
          Create Form
        </button>
        <button
          id="tab-submissions"
          className={`tab-btn ${view === 'submissions' ? 'tab-active' : ''}`}
          onClick={() => setView('submissions')}
        >
          <span className="tab-icon">📋</span>
          Submissions
        </button>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="app-main">
        {view === 'create' ? (
          <FormCreator />
        ) : view === 'submissions' ? (
          <SubmissionsList />
        ) : (
          <div className="card">
            <div className="card-header">
              <h2>📋 Employee Basic Details</h2>
              <p className="card-subtitle">
              Fill in the required fields and click Submit
              </p>
            </div>
            <div className="card-body">
              <EmployeeForm onSubmitSuccess={handleSubmitSuccess} />
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="app-footer">
        <p>Form.io Self-Hosted POC &nbsp;·&nbsp; Data stored in MongoDB &nbsp;·&nbsp; Powered by @formio/react</p>
        <p className="footer-api">
          API: <code>http://localhost:3001</code> &nbsp;|&nbsp;
          Form: <code>/form/employeeform</code>
        </p>
      </footer>

      {/* ── Toast notifications ──────────────────────────────────────────── */}
      <ToastContainer theme="light" />
    </div>
  );
};

export default App;
