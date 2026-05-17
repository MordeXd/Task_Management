# Phase 6: Security, Testing & Hardening

**Goal:** Rate limits, validation, permission decorators, tests, JWT hardening, logging.

---

## Step 6.1 – Rate limiting

**Prompt:**

```
Phase 6, Step 6.1.

Previous context:
[Paste Phase 5 completion memory]

Goal: flask-limiter on sensitive routes.

Limits:
- login: 5/minute per IP
- forgot-password: 3/hour per email (custom key)
- reset-password: 5/minute per IP
- general API: 100/minute per authenticated user id

Return 429 with Retry-After.

Output: config + decorated routes, files list, memory block.
```

---

## Step 6.2 – Input sanitization & CORS

**Prompt:**

```
Phase 6, Step 6.2.

Previous context:
[Paste memory from Step 6.1]

Goal: Validate inputs and tighten CORS.

Backend:
1. Marshmallow schemas (or pydantic/marshmallow) for request bodies; reject unknown fields.
2. CORS_ORIGINS env — dev: http://localhost:5173 (Vite), not 3000 unless using CRA.
3. Optional Flask-Talisman security headers.
4. Document: JWT in Authorization header (no cookie CSRF concern for SPA).

Output: validators, config, files list, memory block.
```

---

## Step 6.3 – Permission middleware consolidation

**Prompt:**

```
Phase 6, Step 6.3.

Previous context:
[Paste memory from Step 6.2]

Goal: Centralize RBAC.

Backend:
1. Decorators/helpers: `@require_roles(['admin'])`, `require_company_access(user, resource_company_id)`, `get_current_user()`.
2. Refactor routes to use decorators; verify URL params (:id) belong to same company.
3. Block privilege escalation (employee cannot set role=admin, etc.).

Output: refactored modules, files list, memory block.
```

---

## Step 6.4 – Backend unit & integration tests

**Prompt:**

```
Phase 6, Step 6.4.

Previous context:
[Paste memory from Step 6.3]

Goal: pytest suite.

1. pytest + test MongoDB database (or mongomock).
2. Fixtures: super_admin, admin, employee, company, tasks.
3. Tests: auth, user management RBAC, task CRUD/complete, rate limits (limiter test config).
4. Mock Celery `.delay` — no real email.

Output: tests/, conftest.py, pytest.ini, how to run `pytest`, files list, memory block.
```

---

## Step 6.5 – Frontend unit tests (Redux & components)

**Prompt:**

```
Phase 6, Step 6.5.

Previous context:
[Paste memory from Step 6.4]

Goal: Vitest + React Testing Library.

Tests:
1. authSlice — login success/failure, logout
2. tasksSlice — fetch/create loading states
3. LoginPage — submit dispatches login
4. RequireAuth — redirects when no token

Output: vitest config, sample tests, npm script, files list, memory block.
```

---

## Step 6.6 – Pen-test checklist & JWT hardening

**Prompt:**

```
Phase 6, Step 6.6.

Previous context:
[Paste memory from Step 6.5]

Goal: Production JWT policy.

Backend:
1. Access token 15m, refresh 7d.
2. Refresh rotation: new refresh token, invalidate old (Redis blacklist set).
3. Logout blacklists refresh jti.
4. Password policy: min 8 chars, complexity in zod + backend.
5. Optional: lockout after N failed logins.

Deliver: code + short PEN_TEST.md checklist in docs/.

Output: files list, memory block.
```

---

## Step 6.7 – Logging & monitoring

**Prompt:**

```
Phase 6, Step 6.7.

Previous context:
[Paste memory from Step 6.6]

Goal: Structured logging and optional Sentry.

Backend:
1. JSON or structured logging with request id middleware (duration, status, user id).
2. Sentry if SENTRY_DSN set.
3. Celery task failure logging.

Frontend:
- Optional Sentry boundary hook.

Output: logging config, files list, Phase 6 memory summary.
```

---

## Phase 6 — Testing & manual checklist

- [../testing/phase-6-testing.md](../testing/phase-6-testing.md)
- [../manual-testing/phase-6.md](../manual-testing/phase-6.md)
