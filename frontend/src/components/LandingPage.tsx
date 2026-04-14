import React from 'react';

interface LandingPageProps {
  onStartForm: () => void;
  onViewSubmissions: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartForm, onViewSubmissions }) => {
  return (
    <div className="landing-page">
      {/* ── Blurred Orbs Background ────────────────────────────────────── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          {/* Logo */}
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
              </svg>
            </div>
            <span className="landing-logo-text">Form<span>.io</span></span>
          </div>

          {/* Nav Links */}
          <ul className="landing-nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#how">How it Works</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

          {/* Nav CTA */}
          <div className="landing-nav-actions">
            {/* <button className="nav-btn-outline" onClick={onViewSubmissions}>
              View Submissions
            </button> */}
            {/* <button className="nav-btn-solid" onClick={onStartForm}> */}
              {/* Get Started
            </button> */}
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Employee Management · Powered by Form.io
        </div>

        <h1 className="hero-title">
          Employee Onboarding,<br />
          <span className="hero-title-gradient">Simplified.</span>
        </h1>

        <p className="hero-sub">
          A modern, form-driven onboarding system built with React, Form.io, and MongoDB.
          Collect employee details in seconds — no paperwork, no friction.
        </p>

        {/* CTA Buttons */}
        <div className="hero-ctas">
          <button id="cta-start-form" className="cta-primary" onClick={onStartForm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Start Form
          </button>
          {/* <button id="cta-view-submissions" className="cta-secondary" onClick={onViewSubmissions}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 10h18M3 14h18M10 3v18"/>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            View Submissions
          </button> */}
        </div>

        {/* Subtle scroll hint */}
        <p className="hero-note">No login required · Data stored locally in MongoDB</p>
      </section>

      {/* ── Feature Strip ─────────────────────────────────────────────── */}
      <section className="feature-strip" id="how">
        <div className="feature-strip-inner">
          <div className="feature-card">
            <div className="feature-icon feature-icon-indigo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <h3>Dynamic Forms</h3>
              <p>Form schema defined in JSON and rendered by Form.io — no manual HTML required.</p>
            </div>
          </div>

          <div className="feature-divider" />

          <div className="feature-card">
            <div className="feature-icon feature-icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div>
              <h3>MongoDB Storage</h3>
              <p>All submissions persisted locally in MongoDB. Query via REST API anytime.</p>
            </div>
          </div>

          <div className="feature-divider" />

          <div className="feature-card">
            <div className="feature-icon feature-icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div>
              <h3>Instant Preview</h3>
              <p>Submissions appear in a live table view — filterable, scrollable, real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <p>Form.io Self-Hosted POC &nbsp;·&nbsp; React + TypeScript + MongoDB</p>
        <p className="landing-footer-api">
          API: <code>http://localhost:3001</code> &nbsp;|&nbsp;
          Form: <code>/form/employeeform</code>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
