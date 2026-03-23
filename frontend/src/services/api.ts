/**
 * API Service — Communication with Form.io Backend
 * ==================================================
 * All API calls to the Form.io backend are centralized here.
 *
 * Data Flow:
 *  1. getFormSchema()   → GET  /form/{path}               → returns form component definitions
 *  2. submitForm()      → POST /form/{path}/submission     → stores data in MongoDB
 *  3. getSubmissions()  → GET  /form/{path}/submission     → fetches all stored submissions
 *
 * Form.io Submission Structure in MongoDB:
 * {
 *   _id: "...",
 *   form: "<formId>",
 *   data: {
 *     employeeId: "EMP001",
 *     firstName: "John",
 *     lastName: "Doe",
 *     personalEmail: "john@gmail.com",
 *     companyEmail: "john@company.com",
 *     phoneNumber: "+91 98765 43210",
 *     gender: "male",
 *     submit: true
 *   },
 *   created: "...",
 *   modified: "..."
 * }
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_FORMIO_API || 'http://localhost:3001';
const FORM_PATH = import.meta.env.VITE_FORM_PATH || 'employeeform';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export interface FormSubmissionData {
  employeeId: string;
  firstName: string;
  lastName?: string;
  personalEmail: string;
  companyEmail: string;
  phoneNumber: string;
  gender: string;
  [key: string]: unknown;
}

export interface Submission {
  _id: string;
  form: string;
  data: FormSubmissionData;
  created: string;
  modified: string;
}

// ─── 1. Fetch Form Schema ─────────────────────────────────────────────────────
// Returns the form component definitions from Form.io
// The @formio/react <Form> component uses this to render the form
export async function getFormSchema() {
  const res = await api.get(`/form/${FORM_PATH}`);
  return res.data;
}

// ─── 2. Submit Form Data ──────────────────────────────────────────────────────
// Form.io requires the payload wrapped in { data: { ...formFields } }
export async function submitForm(formData: FormSubmissionData) {
  const res = await api.post(`/form/${FORM_PATH}/submission`, {
    data: formData,
  });
  return res.data;
}

// ─── 3. Fetch All Submissions ─────────────────────────────────────────────────
// Returns paginated list. ?limit=25&skip=0 for pagination
export async function getSubmissions(): Promise<Submission[]> {
  const res = await api.get(`/form/${FORM_PATH}/submission?limit=50&sort=-created`);
  return res.data;
}
