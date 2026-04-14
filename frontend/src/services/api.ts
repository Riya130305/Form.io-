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
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASS  = import.meta.env.VITE_ADMIN_PASS  || 'Admin@1234';

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
  // For formio@2.x alias middleware, schema is available at `/{formPath}`
  const res = await api.get(`/${FORM_PATH}`);
  return res.data;
}

// ─── 2. Submit Form Data ──────────────────────────────────────────────────────
// Form.io requires the payload wrapped in { data: { ...formFields } }
export async function submitForm(formData: FormSubmissionData) {
  // Submissions are available at `/{formPath}/submission`
  const res = await api.post(`/${FORM_PATH}/submission`, {
    data: formData,
  });
  return res.data;
}

// ─── 3. Fetch All Submissions ─────────────────────────────────────────────────
// Returns paginated list. ?limit=25&skip=0 for pagination
export async function getSubmissions(): Promise<Submission[]> {
  const res = await api.get(`/${FORM_PATH}/submission?limit=50&sort=-created`);
  return res.data;
}

// ─── 4. Admin Login — returns x-jwt-token ─────────────────────────────────────
// Form.io stores the admin user under the /admin resource, so use /admin/login
// (NOT /user/login — that is for regular end-users and always returns 401 for admin)
export async function loginAdmin(): Promise<string> {
  const res = await api.post('/admin/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASS },
  });
  const token = res.headers['x-jwt-token'] as string | undefined;
  if (!token) throw new Error('Admin login failed: x-jwt-token header missing.');
  return token;
}

// ─── 5. Save Form Schema to Backend ──────────────────────────────────────────
// POST /form with admin JWT — stores a new form schema in MongoDB
export async function saveFormSchema(
  schema: Record<string, unknown>,
  token: string,
): Promise<{ _id: string; path: string; name: string }> {
  const res = await api.post('/form', schema, {
    headers: { 'x-jwt-token': token },
  });
  return res.data;
}

// ─── 6. Fetch Form Schema by ID ───────────────────────────────────────────────
// GET /form/:formId — retrieves the saved schema for final rendering
export async function getFormById(formId: string): Promise<Record<string, unknown>> {
  const res = await api.get(`/form/${formId}`);
  return res.data;
}
