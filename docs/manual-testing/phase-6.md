# Phase 6 — Manual testing checklist

- [ ] 6 rapid failed logins → HTTP 429 on login
- [ ] Forgot-password rate limit triggers appropriately
- [ ] Employee token on admin endpoint → 403
- [ ] Tamper task/user id from another company → 403/404
- [ ] Access token expires ~15m; refresh works; old refresh invalid after rotation
- [ ] Logout blacklists refresh token
- [ ] Injection-style payloads in JSON bodies rejected safely
- [ ] `pytest` passes locally
- [ ] `npm run test` (Vitest) passes locally
