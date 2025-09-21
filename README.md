# 📝 Notes Application

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-black?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-red?logo=mongoose&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-blueviolet?logo=jsonwebtokens&logoColor=white)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

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

## Local Setup

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

## 📬 Contact

Built and maintained by **Ayush Kaneriya**.

- GitHub: [ayushkaneriya05](https://github.com/ayushkaneriya05)
- LinkedIn: [Ayush Kaneriya](https://linkedin.com/in/ayush-kaneriya)
- Email: ayushkaneriya05@gmail.com

---
