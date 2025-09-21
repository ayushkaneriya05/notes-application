# 📝 Notes Application

A **full-stack multi-tenant Notes application** (backend + frontend) built with strict tenant isolation using a **shared-schema approach**.  
This repository demonstrates **multi-tenancy, authentication & authorization, tenant-scoped routing, and a complete frontend workflow**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Multi-Tenancy Approach](#-multi-tenancy-approach)
- [Data Models](#-data-models)
- [Authentication & Authorization](#-authentication--authorization)
- [Backend Routes](#-backend-routes)
- [Seeded Tenants & Test Accounts](#-seeded-tenants--test-accounts)
- [Frontend Structure](#-frontend-structure)
- [Local Setup](#-local-setup)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Security & Hardening](#-security--hardening)
- [Operational Notes](#-operational-notes)
- [MCP Integrations](#-mcp-integrations)
- [Extensions & Next Steps](#-extensions--next-steps)
- [Changelog](#-changelog)
- [Contact](#-contact)

---

## 🔎 Overview

This application implements a **multi-tenant notes system** where multiple organizations can sign up and manage their own notes.

- **Strict isolation** ensures that users from one tenant can **never** access another tenant’s data.
- Includes **backend (Node.js/Express/MongoDB)** and **frontend (React/Vite)**.
- Comes with **seeded tenants** (`Acme` and `Globex`) for local testing.

---

## 🏗 Multi-Tenancy Approach

**Approach:** Shared schema with tenant identifier (`tenant ObjectId`).

### Why this approach?

- Simple, efficient, and works well with **MongoDB + Mongoose**.
- Matches existing code structure: models already include a `tenant` field.
- Seed script supports multiple tenants (`Acme`, `Globex`) out of the box.

### Isolation Enforcement

1. **Schema-level**
   - All tenant-scoped models include `tenant: ObjectId (ref: Tenant)` as a **required field**.
2. **Authentication Middleware**
   - Populates `req.user` with tenant info from JWT.
3. **Route-level Filtering**
   - All queries filter by `tenant: req.user.tenant._id`.
4. **Seed Validation**
   - Use provided tenants (Acme, Globex) to validate isolation.

---

## 📂 Data Models

### Tenant (`notes-backend/models/Tenant.js`)

- `name`: String (required)
- `slug`: String (required, unique)
- `plan`: Enum (`FREE`, `PRO`), default: `FREE`

### User (`notes-backend/models/User.js`)

- `name`: String
- `email`: String (required, unique)
- `password`: String (hashed, required)
- `role`: Enum (`ADMIN`, `MEMBER`), default: `MEMBER`
- `tenant`: ObjectId (ref: Tenant, required)

### Note (`notes-backend/models/Note.js`)

- `title`: String
- `content`: String
- `tenant`: ObjectId (ref: Tenant, required)
- `createdBy`: ObjectId (ref: User, required)

---

## 🔐 Authentication & Authorization

- **Login:** `POST /auth/login` → returns `JWT + user + tenant info`.
- **JWT Middleware:** verifies token, attaches `req.user` with tenant.
- **Role Guard:** `requireRole('ADMIN')` → ensures admin-only access.
- **Change Password:** `POST /auth/change-password`.

---

## 🚏 Backend Routes

| Route                    | Method | Description       | Auth Required | Notes                        |
| ------------------------ | ------ | ----------------- | ------------- | ---------------------------- |
| `/auth/login`            | POST   | Authenticate user | ❌            | Returns token + tenant info  |
| `/auth/change-password`  | POST   | Change password   | ✅            | Verifies old password        |
| `/notes`                 | GET    | List notes        | ✅            | Tenant-scoped                |
| `/notes`                 | POST   | Create note       | ✅            | Enforces tenant + plan limit |
| `/notes/:id`             | GET    | View note         | ✅            | Tenant filter applied        |
| `/notes/:id`             | PUT    | Update note       | ✅            | Tenant filter applied        |
| `/notes/:id`             | DELETE | Delete note       | ✅            | Tenant filter applied        |
| `/tenants/:slug/upgrade` | POST   | Upgrade plan      | ✅ (Admin)    | Validates tenant slug        |
| `/tenants/invite`        | POST   | Invite user       | ✅ (Admin)    | Creates new user in tenant   |

---

## 🌱 Seeded Tenants & Test Accounts

Run the seed script:

```bash
MONGO_URI="your-mongo-uri" JWT_SECRET="a-secret" node seed.js
```

### Tenants

- **Acme** (slug: `acme`, plan: `FREE`)
- **Globex** (slug: `globex`, plan: `FREE`)

### Users (default password: `password`)

- `admin@acme.test` → Admin (Acme)
- `user@acme.test` → Member (Acme)
- `admin@globex.test` → Admin (Globex)
- `user@globex.test` → Member (Globex)

---

## 🎨 Frontend Structure

Located in `notes-frontend/src/`:

- **components/** → UI components (Navbar, NoteModal, InviteModal, etc.)
- **context/** → `AuthContext`, `ToastContext` for global state & messages
- **lib/** → `api.js` (centralized API helper)
- **pages/** → `LoginPage`, `NotesPage`, `UpgradePage`
- **App.jsx** → App bootstrap & routing

### Frontend Auth Flow

1. User logs in → token stored in `AuthContext` + `localStorage`.
2. All API calls attach `Authorization: Bearer <token>`.
3. On `401 Unauthorized`, user is logged out automatically.

---

## ⚙️ Local Setup

### Backend

```bash
cd notes-backend
npm install
# Required ENV variables
export MONGO_URI="your-mongo-uri"
export JWT_SECRET="your-secret"
npm run seed   # seeds Acme & Globex
npm start
```

### Frontend

```bash
cd notes-frontend
npm install
npm run dev
# App runs on http://localhost:5173 (default Vite port)
```

---

## 📡 API Endpoints Reference

- `POST /auth/login` → `{ token, user, tenant }`
- `POST /auth/change-password` → Change password
- `GET /notes` → List tenant notes
- `POST /notes` → Create tenant note (enforces plan limits)
- `GET /notes/:id` → View note
- `PUT /notes/:id` → Update note
- `DELETE /notes/:id` → Delete note
- `POST /tenants/:slug/upgrade` → Upgrade plan (Admin only)
- `POST /tenants/invite` → Invite user (Admin only)

---

## 🔒 Security & Hardening

- ✅ Indexes: `{ tenant, createdAt }` on notes, `{ tenant, email }` on users
- ✅ JWT best practices: rotate keys, use HTTPS, HttpOnly cookies if needed
- ✅ Input validation: enforce via Joi / express-validator
- ✅ Rate limiting: mitigate brute force attacks
- 🔜 Suggested:

  - Tenant scoping middleware
  - Mongoose plugin to auto-enforce tenant presence

---

## 🛠 Operational Notes

- **Backups:** Single DB backup → contains all tenants.
- **Migrations:** Global schema migrations required.
- **Monitoring:** Use Sentry + logging for errors & performance.

---

## 🔗 MCP Integrations

Recommended services:

- **Neon** (serverless Postgres with RLS)
- **Netlify** (frontend hosting)
- **Zapier** (automation flows)
- **Figma** (design → code conversion)
- **Supabase** (Postgres + auth alternative)
- **Builder CMS** (content management)
- **Linear** (issue tracking)
- **Notion** (documentation sync)
- **Sentry** (error monitoring)
- **Semgrep** (security scanning)

---

## 🚀 Extensions & Next Steps

1. Add tenant scoping middleware (`notes-backend/middleware/tenantScope.js`).
2. Implement Mongoose plugin (`models/plugins/tenantPlugin.js`) for auto-filtering.
3. Improve API client (`frontend/lib/api.js`) → token refresh & retries.
4. Add E2E tests for cross-tenant isolation.

---

## 📝 Changelog

- Expanded README with **multi-tenancy details, schema, auth flow, route scoping, frontend mapping, seed instructions, security, and extensions**.

---

## 📬 Contact

Seeded tenants (`Acme` & `Globex`) are provided for quick validation.
For improvements (like tenant middleware or plugins), feel free to extend this project.

---

```

---

Would you like me to also **add badges** (e.g., Node.js, React, MongoDB, Vite) and a **preview screenshot** section at the top so the README looks more polished for GitHub?
```
