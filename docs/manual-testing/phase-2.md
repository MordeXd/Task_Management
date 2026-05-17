# Phase 2 — Manual testing checklist

- [ ] super_admin → `/super-admin` → admin list loads
- [ ] Add admin → temp password in toast/dialog; admin in table
- [ ] Log out; log in as new admin with temp password
- [ ] Admin → `/admin` → add employee → temp password shown; employee in table
- [ ] Admin edits employee name/email → list updates
- [ ] Admin deactivates employee → employee gone or inactive
- [ ] super_admin deactivates admin → admin cannot log in
- [ ] Employee cannot open `/admin` or `/super-admin` (redirect or 403)
- [ ] Tables scroll horizontally on mobile; dialogs usable
