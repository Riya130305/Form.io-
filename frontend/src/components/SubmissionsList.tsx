import React, { useEffect, useState, useCallback } from 'react';
import { getSubmissions, Submission } from '../services/api';
import { toast } from 'react-toastify';

interface SubmissionsListProps {
  refreshTrigger: number;
}

const GENDER_LABELS: Record<string, string> = {
  male: '♂ Male',
  female: '♀ Female',
  other: '⚥ Other',
};

const SubmissionsList: React.FC<SubmissionsListProps> = ({ refreshTrigger }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load submissions: ${msg}`);
      toast.error('Could not load submissions. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions, refreshTrigger]);

  if (loading) {
    return (
      <div className="form-loading">
        <div className="spinner" />
        <p>Loading submissions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error">
        <div className="error-icon">⚠️</div>
        <h3>Error loading submissions</h3>
        <pre>{error}</pre>
        <button className="btn-retry" onClick={loadSubmissions}>🔄 Retry</button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No Submissions Yet</h3>
        <p>Submit the form to see data here. Every submission is stored in MongoDB.</p>
      </div>
    );
  }

  return (
    <div className="submissions-container">
      <div className="submissions-header">
        <h2>📊 Submissions</h2>
        <div className="submissions-meta">
          <span className="badge">{submissions.length} record{submissions.length !== 1 ? 's' : ''}</span>
          <button className="btn-refresh" onClick={loadSubmissions} title="Refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Personal Email</th>
              <th>Company Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, idx) => {
              const d = sub.data;
              return (
                <tr key={sub._id} className="submission-row">
                  <td className="idx-cell">{idx + 1}</td>
                  <td>
                    <span className="emp-id">{d.employeeId || '—'}</span>
                  </td>
                  <td>
                    <span className="emp-name">
                      {[d.firstName, d.lastName].filter(Boolean).join(' ') || '—'}
                    </span>
                  </td>
                  <td>
                    <a href={`mailto:${d.personalEmail}`} className="email-link">
                      {d.personalEmail || '—'}
                    </a>
                  </td>
                  <td>
                    <a href={`mailto:${d.companyEmail}`} className="email-link">
                      {d.companyEmail || '—'}
                    </a>
                  </td>
                  <td>{d.phoneNumber || '—'}</td>
                  <td>
                    <span className={`gender-badge gender-${d.gender}`}>
                      {GENDER_LABELS[d.gender] || d.gender || '—'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(sub.created).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsList;
