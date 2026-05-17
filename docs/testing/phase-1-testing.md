# Phase 1 — Testing prompt (for Claude)

Copy after completing Step 1.6:

```
We have completed Phase 1: Foundation & Authentication.

Write a concise test plan, then generate pytest tests for backend auth endpoints:
- POST /api/auth/login (success, wrong password, inactive user)
- POST /api/auth/refresh (valid, invalid, expired)
- GET /api/auth/me (authenticated, missing token)
- POST /api/auth/forgot-password (existing email, non-existing — same response shape)
- POST /api/auth/reset-password (valid token, expired, reused)
- POST /api/auth/change-password (valid old password, wrong old password)

Use a test database/fixtures. Mock Celery email.

Also provide manual frontend test steps for each flow (happy path + common errors).

Frontend URL: http://localhost:5173
Seed login: super@taskflow.com / SuperAdmin123
```
