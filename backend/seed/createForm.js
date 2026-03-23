/**
 * Seed Script — Create the Employee Form in Form.io
 * ====================================================
 * Run this ONCE after the backend server is started:
 *   node seed/createForm.js
 *
 * What this script does:
 *  1. Logs in as admin → gets a JWT token
 *  2. POSTs the Employee Form schema to the backend
 *  3. Prints the form ID and path for use in frontend .env
 *
 * Form fields created (Step 1 — Basic Details):
 *  - Employee ID   (text, required)
 *  - First Name    (text, required)
 *  - Last Name     (text)
 *  - Personal Email (email, required)
 *  - Company Email  (email, required)
 *  - Phone Number  (phoneNumber, required, +91)
 *  - Gender        (select, required: Male/Female/Other)
 */

// Support being run from backend root (via child_process spawn) or from seed/ subfolder
const fs = require('fs');
const envPath = fs.existsSync('.env') ? '.env' : '../.env';
require('dotenv').config({ path: envPath });


const https = require('https');
const http = require('http');

const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Admin@1234';

// ─── Helper: HTTP request wrapper ────────────────────────────────────────────
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-jwt-token': token } : {}),
      },
    };

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── Employee Form Schema ─────────────────────────────────────────────────────
const EMPLOYEE_FORM_SCHEMA = {
  title: 'Employee Basic Details',
  name: 'employeeform',         // ← this becomes the URL path: /form/employeeform
  path: 'employeeform',
  type: 'form',
  display: 'form',
  tags: ['employee', 'hr', 'poc'],
  components: [
    // ── Panel: Step 1 — Basic Details ────────────────────────────────────────
    {
      type: 'panel',
      title: 'Step 1: Basic Details',
      theme: 'primary',
      key: 'panel',
      components: [
        {
          type: 'textfield',
          key: 'employeeId',
          label: 'Employee ID',
          placeholder: 'e.g. EMP001',
          validate: { required: true, minLength: 3 },
          errorLabel: 'Employee ID',
        },
        {
          type: 'columns',
          key: 'nameColumns',
          columns: [
            {
              width: 6,
              components: [
                {
                  type: 'textfield',
                  key: 'firstName',
                  label: 'First Name',
                  placeholder: 'Enter first name',
                  validate: { required: true },
                  errorLabel: 'First Name',
                },
              ],
            },
            {
              width: 6,
              components: [
                {
                  type: 'textfield',
                  key: 'lastName',
                  label: 'Last Name',
                  placeholder: 'Enter last name',
                  validate: { required: false },
                },
              ],
            },
          ],
        },
        {
          type: 'columns',
          key: 'emailColumns',
          columns: [
            {
              width: 6,
              components: [
                {
                  type: 'email',
                  key: 'personalEmail',
                  label: 'Personal Email',
                  placeholder: 'personal@example.com',
                  validate: { required: true },
                  errorLabel: 'Personal Email',
                },
              ],
            },
            {
              width: 6,
              components: [
                {
                  type: 'email',
                  key: 'companyEmail',
                  label: 'Company Email',
                  placeholder: 'name@company.com',
                  validate: { required: true },
                  errorLabel: 'Company Email',
                },
              ],
            },
          ],
        },
        {
          type: 'phoneNumber',
          key: 'phoneNumber',
          label: 'Phone Number',
          placeholder: '+91 98765 43210',
          inputMask: '+91 99999 99999',
          validate: { required: true },
          errorLabel: 'Phone Number',
        },
        {
          type: 'select',
          key: 'gender',
          label: 'Gender',
          placeholder: 'Select gender',
          dataSrc: 'values',
          data: {
            values: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ],
          },
          validate: { required: true },
          errorLabel: 'Gender',
        },
      ],
    },
    // ── Submit Button ─────────────────────────────────────────────────────────
    {
      type: 'button',
      action: 'submit',
      label: 'Submit Employee Details',
      key: 'submit',
      theme: 'primary',
      size: 'md',
      block: true,
    },
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧 Form.io Seed Script — Creating Employee Form\n');
  console.log(`📡 Backend: ${BASE_URL}`);
  console.log(`👤 Admin:   ${ADMIN_EMAIL}\n`);

  // Step 1: Login as admin
  console.log('1️⃣  Logging in as admin...');
const loginRes = await request('POST', '/user/login', {
  data: {
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  },
});

  if (loginRes.status !== 200) {
    console.error('❌ Login failed. Is the backend running? Is MongoDB up?');
    console.error('   Status:', loginRes.status);
    console.error('   Response:', JSON.stringify(loginRes.data, null, 2));
    console.error('\n   Make sure:');
    console.error('   1. MongoDB is running: mongod --dbpath ~/data/db');
    console.error('   2. Backend is running: node index.js (from /backend)');
    process.exit(1);
  }

  const token = loginRes.headers['x-jwt-token'];
  console.log('   ✅ Login successful!\n');

  // Step 2: Check if form already exists
  console.log('2️⃣  Checking if form already exists...');
  const existingRes = await request('GET', '/form?type=form&name=employeeform', null, token);
  if (existingRes.status === 200 && Array.isArray(existingRes.data) && existingRes.data.length > 0) {
    const existing = existingRes.data[0];
    console.log('   ⚠️  Form already exists! Skipping creation.');
    printSummary(existing._id, existing.path);
    return;
  }

  // Step 3: Create the form
  console.log('3️⃣  Creating Employee Form...');
  const createRes = await request('POST', '/form', EMPLOYEE_FORM_SCHEMA, token);

  if (createRes.status !== 201) {
    console.error('❌ Failed to create form!');
    console.error('   Status:', createRes.status);
    console.error('   Response:', JSON.stringify(createRes.data, null, 2));
    process.exit(1);
  }

  const form = createRes.data;
  console.log('   ✅ Form created!\n');
  printSummary(form._id, form.path);
}

function printSummary(formId, formPath) {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              ✅ Employee Form Ready!                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Form ID   : ${formId.padEnd(44)} ║`);
  console.log(`║  Form Path : ${formPath.padEnd(44)} ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  API Endpoints:                                          ║');
  console.log(`║  GET  /form/${formPath.padEnd(13)} → form schema              ║`);
  console.log(`║  POST /form/${formPath}/submission → submit data ║`);
  console.log(`║  GET  /form/${formPath}/submission → all submissions ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Frontend .env:                                          ║');
  console.log('║  VITE_FORMIO_API=http://localhost:3001                   ║');
  console.log(`║  VITE_FORM_PATH=${formPath.padEnd(42)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n  👉 Now start the frontend: cd ../frontend && npm run dev\n');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
