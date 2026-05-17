# Phase 1: Foundation & Authentication

**Goal:** Scaffold both apps, JWT auth, password reset flow, role-based guards.

---

## Step 1.1 – Scaffold & configure projects

**Prompt:**

```
We are building a multi-tenant task management SaaS (TaskFlow). This is Phase 1, Step 1.1.

Previous context: None — we are starting from scratch in an empty monorepo.

Goal:
Create the following folder structure:
- frontend/  → React app with TypeScript, Tailwind CSS v4, Redux Toolkit, shadcn/ui
- backend/   → Flask app with config factory

For frontend:
1. Initialise with Vite + React + TypeScript (prefer Vite over CRA for speed).
2. Set up Tailwind CSS v4 (latest Vite plugin approach; no legacy PostCSS config unless required).
3. Install and configure Redux Toolkit and react-redux.
4. Install shadcn/ui: `npx shadcn@latest init` — TypeScript, default style, base color Slate, CSS variables Yes.
   Add: `npx shadcn@latest add button input card label form`
5. Remove boilerplate; App.tsx shows “Hello TaskFlow” in a shadcn Card with a Button (verify shadcn).
6. Mobile-first: use responsive Tailwind classes on the test page.

For backend:
1. Flask project with `create_app()` factory in `backend/app/__init__.py`.
2. python-dotenv loads `.env`; `config.py` has `Config` reading `MONGO_URI`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, `REDIS_URL`, etc.
3. `GET /api/health` → `{"status": "ok"}`.
4. Dependencies: Flask, flask-cors, flask-jwt-extended, pymongo, bcrypt, celery, redis, python-dotenv.
5. `requirements.txt`, `run.py`, `.env.example`.

Required output:
- Full code for each new file.
- End with: files created/modified, how to run frontend and backend locally, and a short “memory” block for Step 1.2.

Frontend rules: TypeScript, mobile-first, shadcn/ui, Redux Toolkit, consistent modern UI.
```

---

## Step 1.2 – User model & DB connection

**Prompt:**

```
Phase 1, Step 1.2.

Previous context:
[Paste memory summary from Step 1.1 here]

Goal: MongoDB connection and User model.

Backend:
1. Connect to MongoDB in the app factory using PyMongo (or MongoEngine). Use MONGO_URI from config.
2. User model/collection fields:
   - name (string, required)
   - email (unique, required, lowercase)
   - password_hash (string)
   - role (enum: super_admin, admin, employee)
   - company_id (ObjectId, nullable for super_admin only)
   - is_active (bool, default True)
   - reset_token_hash (string, nullable)
   - reset_token_expiry (datetime, nullable)
   - created_at, updated_at (UTC)
3. Helpers: set_password(password) with bcrypt; check_password(password).
4. Seed script: if no super_admin exists, create:
   - email: super@taskflow.com
   - password: SuperAdmin123
   - name: Super Admin
   - role: super_admin
   - company_id: null

Frontend: No changes. Keep Hello TaskFlow test Card.

Output: backend code only (model, DB init, seed script), files list, memory block for Step 1.3.
```

---

## Step 1.3 – Redux auth slice & login page

**Prompt:**

```
Phase 1, Step 1.3.

Previous context:
[Paste memory from Step 1.2]

Goal: Redux auth slice and login page.

Frontend:
1. `store/index.ts` (configureStore), `store/authSlice.ts`:
   - state: user | null, accessToken, refreshToken, loading, error
   - thunks: login (POST /api/auth/login), logout (clear Redux + localStorage)
2. `services/api.ts`: axios instance, baseURL from env, request interceptor attaches Bearer token.
3. `pages/LoginPage.tsx`: mobile-first Card; email + password (shadcn Input, Label, Button); errors via shadcn Alert.
   - react-hook-form + zod
4. On success: persist tokens + user (localStorage for now; redux-persist comes in Phase 5), redirect to `/dashboard`.
5. `pages/DashboardPage.tsx`: placeholder “Welcome, {user.name}”.
6. React Router routes for `/login`, `/dashboard`.

Backend:
1. `POST /api/auth/login`: validate email/password, issue access_token (JWT: sub=user id, claims: role, company_id) and refresh_token.
2. Return `{ access_token, refresh_token, user: { id, name, email, role, company_id } }`.
3. Configure JWTManager in app factory (access ~15m, refresh ~7d — can tune in Phase 6).

Output: all new/changed frontend and backend code, files list, memory block.

Frontend rules: TypeScript, mobile-first, shadcn/ui, Redux Toolkit.
```

---

## Step 1.4 – Protected routes & JWT refresh

**Prompt:**

```
Phase 1, Step 1.4.

Previous context:
[Paste memory from Step 1.3]

Goal: Protected routes and token refresh.

Frontend:
1. `components/RequireAuth.tsx`: if no access token → redirect `/login`; else `<Outlet />` or children.
2. Wrap `/dashboard` (and future authed routes) with RequireAuth.
3. `api.ts` response interceptor: on 401, POST `/api/auth/refresh` with refresh token; on success retry original request; on failure dispatch logout.
4. Redux thunk `refreshAccessToken` for silent refresh when needed.

Backend:
1. `POST /api/auth/refresh`: validate refresh token, return new access_token (and optionally rotated refresh_token later in Phase 6).
2. `GET /api/auth/me` with `@jwt_required()`: return current user from DB.

Output: full code, files list, memory block.
```

---

## Step 1.5 – Forgot password & reset flow

**Prompt:**

```
Phase 1, Step 1.5.

Previous context:
[Paste memory from Step 1.4]

Goal: Forgot password and reset password flows.

Requirements:
- Forgot: user submits email → always return generic success (no email enumeration).
- If user exists: generate reset JWT (30 min), store bcrypt hash in reset_token_hash, set reset_token_expiry.
- Simulate email: log reset link to console (Celery wiring in Phase 4).
- Reset page `/reset-password/:token`: validate token, set new password, clear reset fields (one-time use).

Backend:
1. `POST /api/auth/forgot-password`
2. `POST /api/auth/reset-password` body: `{ token, password }`
3. Celery app boilerplate only (worker not required to pass tests yet)

Frontend:
1. `ForgotPasswordPage` — email form, success message
2. `ResetPasswordPage` — password + confirm, zod match; success → redirect `/login` + toast (add Sonner if missing)
3. Link from LoginPage to forgot password
4. shadcn Card, Button, Input, Form patterns

Output: all code, files list, memory block.
```

---

## Step 1.6 – Change password & base user menu

**Prompt:**

```
Phase 1, Step 1.6.

Previous context:
[Paste memory from Step 1.5]

Goal: Change password (authenticated) and app header with user menu.

Frontend:
1. `ChangePasswordPage`: old password, new password, confirm — protected route.
2. Top nav: “TaskFlow”, user menu (Avatar placeholder, name, links: Change Password, Logout).
   - Mobile: shadcn Sheet hamburger for nav links if needed.
3. Logout: clear Redux + localStorage, navigate `/login`.
4. All new UI mobile-responsive.

Backend:
1. `POST /api/auth/change-password` — `@jwt_required()`, verify old password, set new password.

Output: code, files list, Phase 1 memory summary.
```

---

## Phase 1 — Testing prompt (for Claude)

See [../testing/phase-1-testing.md](../testing/phase-1-testing.md).

## Phase 1 — Manual checklist (for you)

See [../manual-testing/phase-1.md](../manual-testing/phase-1.md).
