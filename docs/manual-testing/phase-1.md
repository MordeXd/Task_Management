# Phase 1 — Manual testing checklist

Open **http://localhost:5173**. Login: `super@taskflow.com` / `SuperAdmin123`

- [ ] Super-admin logs in → redirected to dashboard; JWT in localStorage/Redux
- [ ] Wrong email/password shows error (no redirect)
- [ ] Token refresh works (wait 15 min or temporarily shorten access expiry in dev)
- [ ] `/dashboard` redirects to `/login` when logged out
- [ ] Forgot password: submit email → generic success message
- [ ] Reset link in backend/worker logs works; expires after 30 min or after use
- [ ] Change password works; login with new password
- [ ] Logout clears session and redirects to login
- [ ] Mobile: forms full-width; nav/menu usable on small viewport
