# TaskFlow — Multi-tenant Task Management System

Full-stack SaaS for managing companies, users (super admin → admin → employee), and tasks with JWT auth, role-based access, and async email (Celery).

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn-style UI, Redux Toolkit, React Router |
| Backend | Flask, PyMongo, JWT, Celery, Redis |
| Database | MongoDB |

## Quick start (local)

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **MongoDB** running at `mongodb://localhost:27017`

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.\venv\Scripts\python seed.py
.\venv\Scripts\python run.py
```

API: http://localhost:5000/api/health

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 3. Login

| Email | Password | Role |
|--------|----------|------|
| super@taskflow.com | SuperAdmin123 | super_admin |

### Optional: Celery worker

Emails run in eager mode by default (logged to console). For Redis + worker:

```powershell
# Terminal: Redis running, then
cd backend
.\venv\Scripts\celery -A app.tasks.celery_app worker --loglevel=info
```

Set `CELERY_TASK_ALWAYS_EAGER=false` in `backend/.env` for real async.

## Scripts

- `scripts/start-dev.ps1` — opens backend + frontend in new terminals (Windows)
- `scripts/ec2-bootstrap.sh` — Ubuntu server bootstrap
- `deploy.sh` — production deploy (Linux)

## Features

- JWT login, refresh, logout, forgot/reset/change password
- Super admin: create/list/deactivate admins
- Admin: create/list/deactivate employees
- Tasks: create, assign, complete, filter; role-scoped visibility
- Rate limiting, mobile-responsive UI, dark mode toggle
- Pytest backend tests (`cd backend && .\venv\Scripts\python -m pytest`)

## Project structure

```
backend/          Flask API
frontend/         React SPA
docs/             Build prompts & checklists
scripts/          Dev & deploy helpers
```

## Build prompts

Step-by-step Claude prompts: [docs/README.md](./docs/README.md)
