# TaskFlow — Claude step-by-step build guide

This folder contains **copy-paste prompts** for building the multi-tenant task management SaaS in order. Each prompt assumes the previous step’s **memory summary** (files changed + how to run) is pasted into the next prompt.

## Stack (enforced in every frontend step)

| Layer | Choice |
|--------|--------|
| Frontend | React, **TypeScript**, **Vite**, **Tailwind CSS v4**, **shadcn/ui**, **Redux Toolkit**, mobile-first responsive UI |
| Backend | **Flask** (app factory), **MongoDB**, **JWT**, **Celery** + **Redis** |
| Auth | Role hierarchy: `super_admin` → `admin` → `employee` |

See [FRONTEND-STANDARDS.md](./FRONTEND-STANDARDS.md) for UI and state rules.

## How to use

1. Start with an **empty** `frontend/` and `backend/` in this monorepo (or let Step 1.1 create them).
2. Open [prompts/phase-1-foundation-auth.md](./prompts/phase-1-foundation-auth.md) and run **Step 1.1** in Claude (or Cursor).
3. After each step, **save Claude’s summary** (modified files + run commands). Paste it into the **Previous context** section of the next prompt (or use the [memory template](./MEMORY-TEMPLATE.md)).
4. **Run locally** before advancing (frontend + backend + MongoDB; Redis/Celery when email steps begin).
5. At phase end, run the **testing prompt** from [testing/](./testing/) and complete the **manual checklist** in [manual-testing/](./manual-testing/).

## Prompt index

| Phase | Goal | Prompts file |
|-------|------|----------------|
| 1 | Foundation & authentication | [phase-1-foundation-auth.md](./prompts/phase-1-foundation-auth.md) |
| 2 | Company & user management | [phase-2-company-users.md](./prompts/phase-2-company-users.md) |
| 3 | Task management core | [phase-3-tasks.md](./prompts/phase-3-tasks.md) |
| 4 | Async email (Celery) | [phase-4-email.md](./prompts/phase-4-email.md) |
| 5 | UI/UX polish | [phase-5-ui-polish.md](./prompts/phase-5-ui-polish.md) |
| 6 | Security & tests | [phase-6-security-testing.md](./prompts/phase-6-security-testing.md) |
| 7 | AWS EC2 deployment | [phase-7-deployment.md](./prompts/phase-7-deployment.md) |

## Local URLs (defaults)

- Frontend (Vite): `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health: `GET http://localhost:5000/api/health`

Set `VITE_API_BASE_URL` (or equivalent) and backend `CORS_ORIGINS` to the Vite origin in development.

## Seeded super admin (after Step 1.2)

- Email: `super@taskflow.com`
- Password: `SuperAdmin123`

## Notes for Claude sessions

- Some steps reference resuming a long Claude thread (`claude --resume <id>`). In Cursor, paste **Previous context** instead.
- Phase 2 assumes a **Company** document exists for admins/employees; Step 2.0 in Phase 2 creates it if you started from scratch.
