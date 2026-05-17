# Phase 6 — Testing prompt (for Claude)

```
Phase 6 security hardening is complete.

Produce a security testing guide:
- Rate limiting (login 6th attempt → 429)
- Expired access token + refresh rotation
- Logout blacklist
- Role escalation attempts (employee calling admin APIs)
- Cross-company ID tampering on tasks/users
- CORS preflight from wrong origin
- NoSQL injection attempts in query/body (rejected/ignored)

Include a post-deploy smoke test script (bash) hitting /api/health and login.
```
