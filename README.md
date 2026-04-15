<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project. -->
# SB Document Management System

A web-based document tracking and management system for the SB Office and all Barangays.

---

## 📁 Project Structure

```
sb-document-system/
├── src/
│   ├── firebase/
│   │   ├── config.js              ← Firebase initialization
│   │   ├── authService.js         ← Login, logout, auth functions
│   │   ├── firestoreService.js    ← All Firestore DB operations
│   │   └── storageService.js      ← File upload/download/delete
│   │
│   ├── context/
│   │   └── AuthContext.js         ← Global auth state (useAuth hook)
│   │
│   ├── hooks/
│   │   └── useDocuments.js        ← Document CRUD operations hook
│   │
│   ├── utils/
│   │   ├── constants.js           ← Categories, statuses, barangay list
│   │   └── helpers.js             ← formatDate, filterDocuments, etc.
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.js  ← Role-based route protection
│   │   ├── admin/
│   │   │   ├── StatusModal.js     ← Update document status modal
│   │   │   └── StatusModal.css
│   │   └── shared/
│   │       ├── MainLayout.js      ← App shell with sidebar
│   │       ├── MainLayout.css     ← Shared page styles
│   │       ├── Sidebar.js         ← Navigation sidebar
│   │       ├── Sidebar.css
│   │       └── DeleteConfirmModal.js
│   │
│   ├── pages/
│   │   ├── LoginPage.js           ← Login for all users
│   │   ├── LoginPage.css
│   │   ├── admin/
│   │   │   ├── AdminDashboard.js  ← Admin overview
│   │   │   ├── AdminDocuments.js  ← All docs with search/filter
│   │   │   ├── AdminBarangays.js  ← All barangay profiles
│   │   │   ├── AdminActivityLogs.js
│   │   │   └── AdminManageUsers.js← Create barangay accounts
│   │   └── barangay/
│   │       ├── BarangayDashboard.js
│   │       ├── BarangayDocuments.js
│   │       ├── UploadDocument.js  ← Drag & drop upload
│   │       └── BarangayProfile.js ← Edit barangay info & org charts
│   │
│   ├── App.js                     ← All routes defined here
│   ├── index.js
│   └── index.css
│
├── firestore.rules                ← Security rules for Firestore
├── storage.rules                  ← Security rules for Storage
├── .env.example                   ← Copy to .env and fill in values
└── package.json
```

---

## 🚀 Setup Instructions

### Step 1: Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → name it `sb-document-system`
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** (Start in production mode)
5. Enable **Storage** (Start in production mode)

### Step 2: Get Firebase Config
1. Go to Project Settings → Your apps → Web app
2. Copy the `firebaseConfig` object values

### Step 3: Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Fill in your Firebase values in .env
REACT_APP_FIREBASE_API_KEY=your_actual_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... etc
```

### Step 4: Install and Run
```bash
npm install
npm start
```

### Step 5: Deploy Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules,storage
```

### Step 6: Create the Admin Account
In Firebase Console → Authentication → Add User:
- Email: `admin@sbnaicoffice.gov.ph`
- Password: (your choice)

Then in Firestore → Create document in `users` collection:
```json
{
  "displayName": "SB Admin",
  "email": "admin@sbnaicoffice.gov.ph",
  "role": "admin"
}
```
(The document ID must match the Firebase Auth UID)

### Step 7: Create Barangay Accounts
Log in as admin → Go to **Manage Users** → Click **Add Barangay Account**

---

## 🗄️ Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | User profiles with role and barangayId |
| `barangays` | Barangay profile, org charts, committees |
| `documents` | All uploaded document records |
| `activityLogs` | Immutable audit trail |
| `notifications` | In-app notifications per user |

---

## 🔐 User Roles

| Role | Access |
|---|---|
| `admin` | All barangays, all documents, status updates, user management |
| `barangay` | Own documents only, upload, view profile |

---

## ✅ Features Implemented

- [x] Role-based authentication (Admin + Barangay)
- [x] Barangay profile (address, contacts, org charts, committees)
- [x] Document upload with drag-and-drop + progress bar
- [x] Auto file naming (BARANGAY_CATEGORY_YYYYMMDD)
- [x] Document categories (resolution, ordinance, report, etc.)
- [x] View, Download, Delete documents
- [x] Search & filter (name, category, status, date range, barangay)
- [x] Tracking system with status (Pending, Reviewed, Approved, Rejected, For Revision)
- [x] Admin status update with review notes
- [x] Real-time updates (Firestore listeners)
- [x] Activity logs
- [x] In-app notifications
- [x] Mobile responsive sidebar
- [x] Firestore + Storage security rules

---

## 📦 Dependencies

```
react-router-dom    → Navigation and routing
firebase            → Database, auth, storage
react-dropzone      → Drag & drop file upload
react-hot-toast     → Toast notifications
date-fns            → Date formatting
lucide-react        → Icons (optional)
```