# Form.io POC — Employee Onboarding System

> **Beginner-friendly guide** — Read every step carefully. Don't skip anything!

A complete **Proof of Concept** using:
- 🖥️  **Frontend**: React + TypeScript (Vite)
- ⚙️  **Backend**: Node.js + Form.io server (Express-based)
- 🗄️  **Database**: MongoDB (local)

---

## 📁 Folder Structure

```
Form.io/
├── backend/                  ← Form.io Node.js server
│   ├── index.js              ← Server entry point
│   ├── package.json
│   ├── .env                  ← Backend config (MongoDB URI, secrets)
│   └── seed/
│       └── createForm.js     ← Script to create the employee form
│
├── frontend/                 ← React + TypeScript app
│   ├── src/
│   │   ├── App.tsx           ← Main layout + tab navigation
│   │   ├── main.tsx          ← React root
│   │   ├── index.css         ← Premium dark-mode styles
│   │   ├── components/
│   │   │   ├── EmployeeForm.tsx     ← Form.io React renderer
│   │   │   └── SubmissionsList.tsx  ← Displays stored submissions
│   │   └── services/
│   │       └── api.ts        ← All HTTP calls to backend
│   ├── .env                  ← Backend URL config
│   └── index.html
│
└── README.md                 ← You are here!
```

---

## ✅ Prerequisites

Before starting, make sure you have:

| Tool | Check command | Min version |
|------|--------------|-------------|
| **Node.js** | `node --version` | v18+ |
| **npm** | `npm --version` | v7+ |
| **MongoDB** | `mongod --version` | v6+ |

If MongoDB is not installed, see: https://www.mongodb.com/docs/manual/installation/

---

## 🚀 Step-by-Step Setup

### Step 1 — Start MongoDB

MongoDB must be running BEFORE you start the backend.

```bash
# Create data directory (first time only)
mkdir -p ~/data/db

# Start MongoDB
mongod --dbpath ~/data/db
```

> ✅ You should see: `Waiting for connections on port 27017`

Keep this terminal **open**. Open a new terminal for the next step.

---

### Step 2 — Start the Backend (Form.io Server)

```bash
# Navigate to backend folder
cd /home/riya/Desktop/Form.io/backend

# Install dependencies (first time only)
npm install

# Start the Form.io server
node index.js
```

> ✅ You should see the Form.io startup banner with:
> ```
> 🚀 API running at: http://localhost:3001
> ```

**First run only**: Form.io automatically creates:
- Admin user in MongoDB (`admin@example.com` / `Admin@1234`)
- Required database collections (forms, submissions, roles, users)

Keep this terminal **open**. Open a new terminal.

---

### Step 3 — Create the Employee Form (Seed Script)

This runs **once** to create the form definition in MongoDB:

```bash
cd /home/riya/Desktop/Form.io/backend

node seed/createForm.js
```

> ✅ You should see the success banner:
> ```
> ✅ Employee Form Ready!
> Form ID  : 65abc123...
> Form Path: employeeform
> ```

If you see an error:
- Check MongoDB is running (Step 1)
- Check backend is running on port 3001 (Step 2)

---

### Step 4 — Start the Frontend

```bash
# Open a NEW terminal
cd /home/riya/Desktop/Form.io/frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

> ✅ You should see:
> ```
> VITE v4.x  ready in 300ms
> ➜  Local:   http://localhost:5173/
> ```

Open **http://localhost:5173** in your browser.

---

## 🧪 Testing End-to-End

### 1. Submit a Form

1. Open **http://localhost:5173**
2. Fill in all required fields:
   - Employee ID (e.g., `EMP001`)
   - First Name (e.g., `John`)
   - Personal Email (e.g., `john@gmail.com`)
   - Company Email (e.g., `john@company.com`)
   - Phone Number (e.g., `+91 98765 43210`)
   - Gender (select `Male`)
3. Click **Submit Employee Details**
4. ✅ You'll see a green success toast

### 2. View Submissions

1. Click **"View Submissions"** tab
2. Your submission appears in the table
3. All data is fetched live from MongoDB via the Form.io API

### 3. Verify in MongoDB (optional)

```bash
# Connect to MongoDB
mongosh

# Select the database
use formio-poc

# See all form definitions
db.forms.find({}, { title: 1, path: 1 }).pretty()

# See all submissions
db.submissions.find().pretty()
```

---

## 🌐 API Reference

All endpoints are served by Form.io automatically:

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/user/login` | Login (returns JWT token) |
| `GET` | `/form/employeeform` | Get form schema (components) |
| `POST` | `/form/employeeform/submission` | Submit form data |
| `GET` | `/form/employeeform/submission` | Fetch all submissions |

### Example: Get form schema
```bash
curl http://localhost:3001/form/employeeform
```

### Example: Submit form data
```bash
curl -X POST http://localhost:3001/form/employeeform/submission \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "personalEmail": "john@gmail.com",
      "companyEmail": "john@company.com",
      "phoneNumber": "+91 98765 43210",
      "gender": "male"
    }
  }'
```

### Example: Fetch all submissions
```bash
curl http://localhost:3001/form/employeeform/submission
```

---

## 🗄️ How Form.io Stores Data in MongoDB

Form.io creates these MongoDB collections automatically:

| Collection | What's stored |
|------------|--------------|
| `forms` | Form schemas (field definitions, validation rules) |
| `submissions` | All form submission data |
| `roles` | User roles (Administrator, Authenticated, etc.) |
| `users` | Admin and end users |

### Submission document structure:
```json
{
  "_id": "65abc123...",
  "form": "65def456...",
  "data": {
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "personalEmail": "john@gmail.com",
    "companyEmail": "john@company.com",
    "phoneNumber": "+91 98765 43210",
    "gender": "male",
    "submit": true
  },
  "created": "2026-03-19T10:00:00.000Z",
  "modified": "2026-03-19T10:00:00.000Z",
  "owner": null,
  "roles": [],
  "state": "submitted"
}
```

---

## 🔄 Data Flow Diagram

```
User fills form in browser
         ↓
React EmployeeForm.tsx
         ↓ (POST /form/employeeform/submission)
Form.io Express Server (port 3001)
         ↓
Form.io validates data against form schema
         ↓
MongoDB: saves to `submissions` collection
         ↓ (HTTP 201 Created)
React shows success toast ✅
         ↓
User clicks "View Submissions"
         ↓ (GET /form/employeeform/submission)
MongoDB: reads from `submissions` collection
         ↓
React SubmissionsList.tsx renders table
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb://localhost:27017/formio-poc   # MongoDB database URL
PORT=3001                                         # Server port
JWT_SECRET=supersecretkey123                      # Token signing secret
ADMIN_EMAIL=admin@example.com                     # Auto-created admin
ADMIN_PASS=Admin@1234                             # Admin password
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_FORMIO_API=http://localhost:3001   # Backend URL
VITE_FORM_PATH=employeeform             # Form path from seed script
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|---------|
| `ECONNREFUSED 27017` | MongoDB is not running. Run `mongod --dbpath ~/data/db` |
| `ECONNREFUSED 3001` | Backend is not running. Run `node index.js` in `/backend` |
| Form doesn't load | Run the seed script (`node seed/createForm.js`) first |
| Port 3001 in use | Kill the old process: `lsof -ti:3001 \| xargs kill` |
| Port 5173 in use | Kill: `lsof -ti:5173 \| xargs kill` |
| `Cannot find module 'formio'` | Run `npm install` in `/backend` |

---

## 🏁 Quick Start (All at once)

```bash
# Terminal 1: MongoDB
mongod --dbpath ~/data/db

# Terminal 2: Backend
cd /home/riya/Desktop/Form.io/backend
npm install && node index.js

# Terminal 3: Seed (run once)
cd /home/riya/Desktop/Form.io/backend
node seed/createForm.js

# Terminal 4: Frontend
cd /home/riya/Desktop/Form.io/frontend
npm install && npm run dev
```

Then open: **http://localhost:5173** 🎉
# Form.io-
