# Phase 4: Asynchronous Email Notifications

**Goal:** All emails via Celery; API never blocks on send.

> **Note:** Resume long Claude sessions with `claude --resume <id>` if needed; otherwise paste Previous context.

---

## Step 4.1 – Setup Celery & Redis

**Prompt:**

```
Phase 4, Step 4.1.

Previous context:
[Paste Phase 3 completion memory]

Goal: Celery + Redis broker and placeholder send_email task.

Backend:
1. `celery_app.py` or factory integration — broker from REDIS_URL in config.
2. `app/tasks/` package with autodiscover.
3. Task `send_email(to, subject, body)` — logs payload for now.
4. Document worker command: `celery -A app.tasks worker --loglevel=info` (adjust module path to match project).
5. Flask shell example: `send_email.delay(...)`.

Frontend: none.

Output: backend code, files list, memory block.
```

---

## Step 4.2 – Wire up existing email triggers

**Prompt:**

```
Phase 4, Step 4.2.

Previous context:
[Paste memory from Step 4.1]

Goal: Replace print/log email simulation with Celery.delay.

Backend:
Replace synchronous logs with `send_email.delay` for:
1. Forgot password reset link
2. New admin/employee temp credentials
3. Task assigned notification (title, due date, link to frontend /my-tasks or /tasks/:id)

Helpers:
- send_password_reset_email(user, reset_link)
- send_welcome_credentials_email(user, temp_password)
- send_task_assigned_email(assignee, task, app_base_url)

Output: backend changes only, files list, memory block.
```

---

## Step 4.3 – Real email integration (Brevo)

**Prompt:**

```
Phase 4, Step 4.3.

Previous context:
[Paste memory from Step 4.2]

Goal: Real transactional email via Brevo.

Backend:
1. `BREVO_API_KEY` in .env.example
2. Implement send_email in `app/tasks/email_tasks.py` using Brevo API (requests or sib-api-v3-sdk).
3. Retries on failure (Celery autoretry).
4. Optional EmailLog collection: to, subject, status, error, created_at.

Frontend: none.

Output: task code, config, files list, memory block.
```

---

## Step 4.4 – Email status & verification

**Prompt:**

```
Phase 4, Step 4.4.

Previous context:
[Paste memory from Step 4.3]

Goal: Verify end-to-end — minimal or no code.

Deliver:
1. pytest that mocks Brevo and asserts `send_email.delay` called with expected args when task is created.
2. Manual verification steps: start Redis + worker, trigger forgot password and task assign, check inbox/spam.
3. Optional future: super_admin email log viewer — stub only.

No large code changes unless tests are missing.
```

---

## Phase 4 — Testing & manual checklist

- [../testing/phase-4-testing.md](../testing/phase-4-testing.md)
- [../manual-testing/phase-4.md](../manual-testing/phase-4.md)
