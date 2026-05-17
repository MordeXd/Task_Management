# Phase 2 — Testing prompt (for Claude)

```
We've built Phase 2: User management.

Write pytest tests for:
- GET/POST /api/company/admins (super_admin only)
- GET/POST /api/company/employees (admin only)
- PUT /api/company/users/:id
- PATCH /api/company/users/:id/deactivate (cannot self-deactivate)
- Role access: employee gets 403 on admin endpoints; admin cannot access super_admin routes
- Company scoping: user from company A cannot modify company B user

Mock Celery. Provide a manual frontend testing guide for SuperAdmin and Admin pages.
```
