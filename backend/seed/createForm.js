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

const PORT = process.env.PORT || 3001;
// Project alias (optional). Your current frontend calls the backend without this prefix.
// We still keep it for optional/diagnostic login attempts.
const PROJECT_ALIAS = process.env.PROJECT || '';

// Backend base URL (no project prefix)
const BASE_URL = `http://localhost:${PORT}`;

// Used when bootstrapping default auth template locally (JWT signing/verification).
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
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
  // Allow anonymous users to render and submit the form from the frontend.
  access: [{ type: 'read_all', roles: ['anonymous'] }],
  submissionAccess: [{ type: 'create_all', roles: ['anonymous'] }],
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

async function bootstrapFormioAuthAndRootAdmin() {
  const formio = require('formio');

  const formioRouter = formio({
    mongo: process.env.MONGO_URI,
    email: { transport: 'stub' },
    jwt: { secret: JWT_SECRET, expireTime: 240 },
  });

  await formioRouter.init();

  const FormModel = formioRouter.formio.resources.form.model;
  const RoleModel = formioRouter.formio.resources.role.model;
  const SubmissionModel = formioRouter.formio.resources.submission.model;

  // 1) Ensure the default auth template exists (adminLogin/userLogin/user/admin resources/actions).
  let adminLoginForm = await FormModel.findOne({
    name: 'adminLogin',
    type: 'form',
    deleted: { $eq: null },
  }).lean().exec();

  if (!adminLoginForm) {
    console.log('   ⏳ Bootstrapping Form.io default auth template...');

    const defaultTemplate = require('formio/src/templates/default.json');
    const template = JSON.parse(JSON.stringify(defaultTemplate));

    // If your environment expects a project alias, align the template's project name.
    if (PROJECT_ALIAS) {
      template.name = PROJECT_ALIAS;
    }

    await new Promise((resolve, reject) => {
      formioRouter.formio.template.import.template(template, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });

    adminLoginForm = await FormModel.findOne({
      name: 'adminLogin',
      type: 'form',
      deleted: { $eq: null },
    }).lean().exec();

    if (!adminLoginForm) {
      throw new Error('Form.io bootstrap failed: `adminLogin` form still missing.');
    }
  }

  // 2) Ensure root admin user exists in the `admin` resource.
  const adminResource = await FormModel.findOne({
    name: 'admin',
    type: 'resource',
    deleted: { $eq: null },
  }).lean().exec();

  if (!adminResource) {
    throw new Error('Form.io bootstrap failed: `admin` resource missing.');
  }

  const adminRole = await RoleModel.findOne({
    machineName: 'administrator',
    deleted: { $eq: null },
  }).lean().exec();

  if (!adminRole) {
    throw new Error('Form.io bootstrap failed: `administrator` role missing.');
  }

  const existingAdmin = await SubmissionModel.findOne({
    form: adminResource._id,
    'data.email': ADMIN_EMAIL,
    deleted: { $eq: null },
  }).lean().exec();

  if (!existingAdmin) {
    console.log('   ⏳ Creating root admin user...');
    const passwordHash = await new Promise((resolve, reject) => {
      formioRouter.formio.encrypt(ADMIN_PASS, (err, hash) => {
        if (err) return reject(err);
        return resolve(hash);
      });
    });

    await SubmissionModel.create({
      form: adminResource._id,
      data: {
        email: ADMIN_EMAIL,
        password: passwordHash,
      },
      roles: [adminRole._id],
    });
  }

  return { formioRouter, adminLoginFormId: adminLoginForm._id.toString() };
}

async function loginAdminViaAdminLoginForm() {
  // adminLogin is a normal Form.io form (not /user/login in formio@2.5.0)
  const { formioRouter, adminLoginFormId } = await bootstrapFormioAuthAndRootAdmin();

  const loginPath = `/form/${adminLoginFormId}/submission`;
  const loginUrl = `${BASE_URL}${loginPath}`;
  const payload = {
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    },
  };

  console.log('1️⃣  Logging in as admin...');
  console.log(`[DEBUG] Login URL: ${loginUrl}`);
  console.log(`[DEBUG] Login payload: ${JSON.stringify(payload)}`);

  const loginRes = await request('POST', loginPath, payload, null);

  // Requested debug: show what came back on failure.
  if (loginRes.status !== 200) {
    console.error('❌ Login failed (HTTP).');
    console.error(`[DEBUG] Login URL: ${loginUrl}`);
    console.error('   Status:', loginRes.status);
    console.error('   Response:', JSON.stringify(loginRes.data, null, 2));
    return { token: null, formioRouter, adminLoginFormId };
  }

  const token = loginRes.headers['x-jwt-token'];
  if (!token) {
    console.error('❌ Login failed: token header `x-jwt-token` missing.');
    console.error(`[DEBUG] Login URL: ${loginUrl}`);
    console.error('   Response:', JSON.stringify(loginRes.data, null, 2));
    return { token: null, formioRouter, adminLoginFormId };
  }

  console.log('   ✅ Login successful!\n');
  return { token, formioRouter, adminLoginFormId };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔧 Form.io Seed Script — Creating Employee Form\n');
  console.log(`📡 Backend: ${BASE_URL}`);
  console.log(`👤 Admin:   ${ADMIN_EMAIL}\n`);

  // 1) Bootstrapping + admin login to get JWT (for production-like flow).
  const { token, formioRouter } = await loginAdminViaAdminLoginForm();

  // 2) Ensure employeeform exists AND has correct anonymous access.
  console.log('2️⃣  Ensuring `employeeform` access + existence...');

  const FormModel = formioRouter.formio.resources.form.model;
  const RoleModel = formioRouter.formio.resources.role.model;

  const anonymousRole = await RoleModel.findOne({
    machineName: 'anonymous',
    deleted: { $eq: null },
  }).lean().exec();

  if (!anonymousRole) {
    throw new Error('Form.io bootstrap failed: `anonymous` role missing.');
  }

  const employeeSchema = JSON.parse(JSON.stringify(EMPLOYEE_FORM_SCHEMA));
  // Use role IDs directly so permissions don't end up empty.
  employeeSchema.access = [{ type: 'read_all', roles: [anonymousRole._id.toString()] }];
  employeeSchema.submissionAccess = [
    { type: 'read_all', roles: [anonymousRole._id.toString()] },
    { type: 'create_all', roles: [anonymousRole._id.toString()] },
  ];

  const existingLocal = await FormModel.findOne({
    name: employeeSchema.name,
    type: 'form',
    deleted: { $eq: null },
  }).lean().exec();

  if (existingLocal) {
    await FormModel.updateOne(
      { _id: existingLocal._id },
      { $set: employeeSchema },
    );
    const updated = await FormModel.findOne({ _id: existingLocal._id }).lean().exec();
    console.log('   ✅ Employee form updated (access fixed).\n');
    printSummary(updated._id, updated.path);
    return;
  }

  const createdLocal = await FormModel.create(employeeSchema);
  console.log('   ✅ Employee form created.\n');
  printSummary(createdLocal._id, createdLocal.path);
}

function printSummary(formId, formPath) {
  const formIdStr = String(formId);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              ✅ Employee Form Ready!                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Form ID   : ${formIdStr.padEnd(44)} ║`);
  console.log(`║  Form Path : ${formPath.padEnd(44)} ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  API Endpoints:                                          ║');
  console.log(`║  GET  /${formPath.padEnd(13)} → form schema              ║`);
  console.log(`║  POST /${formPath}/submission → submit data ║`);
  console.log(`║  GET  /${formPath}/submission → all submissions ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Frontend .env:                                          ║');
  console.log(`║  VITE_FORMIO_API=${BASE_URL.padEnd(50)} ║`);
  console.log(`║  VITE_FORM_PATH=${formPath.padEnd(42)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n  👉 Now start the frontend: cd ../frontend && npm run dev\n');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
