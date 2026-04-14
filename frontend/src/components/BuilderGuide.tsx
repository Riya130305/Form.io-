import React from 'react';

const STEPS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: 'Click "Create New Form"',
    desc: 'Hit the button below to open the Form.io visual drag-and-drop builder in a new tab.',
    color: 'step-color-indigo',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    ),
    title: 'You\'ll Be Redirected to the Builder',
    desc: 'The hosted Form.io builder opens instantly — no login, no install needed.',
    color: 'step-color-violet',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: 'Build Your Form & Export JSON',
    desc: 'Drag components onto the canvas, configure them, then click the "JSON" tab at the top of the builder and copy the entire schema.',
    color: 'step-color-blue',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
    title: 'Paste JSON in the Textarea Below',
    desc: 'Return to this tab and paste the copied JSON into the input box. Invalid JSON will be flagged automatically.',
    color: 'step-color-emerald',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'Preview, Save & Use Your Form',
    desc: 'Click "Load Preview" to see a live render. When happy, click "Save Form" — it\'s stored in MongoDB and ready to use.',
    color: 'step-color-green',
  },
];

const BuilderGuide: React.FC = () => (
  <div className="builder-guide">
    <div className="builder-guide-header">
      <div className="builder-guide-icon">🛠️</div>
      <div>
        <h2 className="builder-guide-title">How to Create a Form</h2>
        <p className="builder-guide-subtitle">5 simple steps to build and deploy a custom form</p>
      </div>
    </div>

    <ol className="step-list">
      {STEPS.map((step, i) => (
        <React.Fragment key={i}>
          <li className={`step-item ${step.color}`}>
            <div className="step-number">{i + 1}</div>
            <div className={`step-icon step-icon-${step.color}`}>{step.icon}</div>
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          </li>
          {i < STEPS.length - 1 && (
            <div className="step-connector" aria-hidden="true">
              <div className="step-connector-line" />
            </div>
          )}
        </React.Fragment>
      ))}
    </ol>
  </div>
);

export default BuilderGuide;
