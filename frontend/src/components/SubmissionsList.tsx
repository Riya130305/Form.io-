import React, { useEffect, useState } from 'react';
import { getSubmissions } from '../services/api';
import { toast } from 'react-toastify';

interface SubmissionData {
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  companyEmail?: string;
  [key: string]: unknown;
}

interface Submission {
  _id: string;
  form: string;
  data: SubmissionData;
  created: string;
  modified: string;
}

const SubmissionsList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formPath, setFormPath] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the last created form path from localStorage
        const savedFormPath = localStorage.getItem('lastCreatedFormPath');
        
        if (!savedFormPath) {
          setError('No form created yet. Please create a form first.');
          setLoading(false);
          return;
        }

        setFormPath(savedFormPath);
        const data = await getSubmissions(savedFormPath);
        setSubmissions(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load submissions';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="submissions-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-container">
        <div className="error-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Error Loading Submissions</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="submissions-container">
        <div className="submissions-header">
          <div>
            <h1>Form Submissions</h1>
            <p className="subtitle">No submissions yet</p>
          </div>
        </div>
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
          <h3>No Submissions Yet</h3>
          <p>When users fill and submit the form, their data will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submissions-container">
      <div className="submissions-header">
        <div>
          <h1>Form Submissions</h1>
          <p className="subtitle">
            {formPath ? `Form: ${formPath}` : 'Loading...'} • Total submissions: {submissions.length}
          </p>
        </div>
      </div>

      <div className="submissions-table-wrapper">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => {
              // Flexible field name extraction - checks multiple possible field names
              const getFieldValue = (data: SubmissionData, possibleNames: string[]) => {
                for (const name of possibleNames) {
                  if (data[name]) {
                    return String(data[name]);
                  }
                }
                return 'N/A';
              };

              const name = getFieldValue(submission.data, ['firstName', 'name', 'fullName', 'employeeName', 'textField', 'nameField']);
              const email = getFieldValue(submission.data, ['personalEmail', 'email', 'companyEmail', 'userEmail', 'emailAddress', 'textField1', 'emailField']);
              const submittedDate = new Date(submission.created).toLocaleDateString();

              return (
                <tr key={submission._id} className="submission-row">
                  <td className="idx-cell">{index + 1}</td>
                  <td className="submission-name">
                    <strong>{name}</strong>
                  </td>
                  <td className="submission-email">
                    <a href={`mailto:${email}`} className="email-link">{email}</a>
                  </td>
                  <td className="submission-date">{submittedDate}</td>
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
