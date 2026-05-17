# Phase 4 — Testing prompt (for Claude)

```
Phase 4 email integration is done.

Write a test that mocks the Brevo/email API and asserts Celery send_email.delay is called with correct to/subject/body when:
1. Forgot password requested
2. Admin created
3. Task assigned

Suggest staging verification steps for real inbox delivery. Document running worker: celery -A ... worker
```
