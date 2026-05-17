# Phase 2: Company & User Management (Role Hierarchy)

**Goal:** Super-Admin manages Admins; Admins manage Employees. No self-registration.

---

## Step 2.0 – Company model (prerequisite)

**Prompt:**

```
Phase 2, Step 2.0.

Previous context:
[Paste Phase 1 completion memory — auth, login, password flows work]

Goal: Introduce Company so admins/employees belong to a tenant.

Backend:
1. Company model: name (required), is_active (default True), created_at, updated_at.
2. Seed: create default company "TaskFlow Demo" if none exists; attach seeded super_admin is still company_id=null OR assign a platform company — document choice: super_admin has null company_id and can manage all companies later; for MVP, create one demo company and allow super_admin to create admins under that company via company_id on admin users.
3. `POST /api/company` (super_admin only) optional — OR auto-use single demo company for MVP.
4. Update admin/employee creation in next steps to require company_id on non-super_admin users.

Frontend: No UI yet. Optional: store company_id on user in auth state if returned from login.

Output: model, seed/migration script updates, files list, memory for Step 2.1.
```

---

## Step 2.1 – Super-Admin: Create & list Admins

**Prompt:**

```
Phase 2, Step 2.1.

Previous context:
[Paste memory from Step 2.0]

Goal: Super-Admin creates and lists Admins.

Frontend:
1. `SuperAdminPage` at `/super-admin` — only `role === super_admin` (route guard).
2. Table of admins (shadcn Table), fetch `GET /api/company/admins`.
3. “Add Admin” → Dialog: name, email, company (select if multiple) — MVP: single company.
4. `POST /api/company/admins` — show temporary password once in toast/dialog success.
5. Mobile: horizontal scroll table; full-width dialog on small screens.

Backend:
1. `GET /api/company/admins` — users with role=admin, scoped by company (super_admin specifies company_id query or default demo company).
2. `POST /api/company/admins` — create admin with random temp password, bcrypt hash, is_active=true, same company_id.
3. Log credential email (Celery in Phase 4).

Redux: `usersSlice` or `adminSlice` — list admins, loading, error, thunks fetch/create.

Output: code, files list, memory block.

Frontend rules: TypeScript, mobile-first, shadcn/ui, Redux Toolkit.
```

---

## Step 2.2 – Admin: Manage Employees

**Prompt:**

```
Phase 2, Step 2.2.

Previous context:
[Paste memory from Step 2.1]

Goal: Admin adds and lists employees.

Frontend:
1. `AdminPage` at `/admin` — role guard `admin` only.
2. Employee table + “Add Employee” Dialog (name, email) — same visual language as SuperAdminPage.
3. Show temp password on create; refresh list.

Backend:
1. `GET /api/company/employees` — role=employee, same company_id as current user.
2. `POST /api/company/employees` — admin only; same company scope.
3. super_admin may list employees with company filter (optional query param).

Redux: extend usersSlice — employee thunks separate from admin.

Output: code, files list, memory block.
```

---

## Step 2.3 – Edit & deactivate users

**Prompt:**

```
Phase 2, Step 2.3.

Previous context:
[Paste memory from Step 2.2]

Goal: Edit users and soft-deactivate.

Frontend:
1. Actions on tables: Edit (Dialog pre-filled: name, email; optional password reset by admin later), Deactivate (AlertDialog confirm).
2. Deactivated users hidden from default list (or filter toggle).
3. super_admin cannot deactivate own account.

Backend:
1. `PUT /api/company/users/:id` — update name, email; same company; admin or super_admin.
2. `PATCH /api/company/users/:id/deactivate` — is_active=false; block self-deactivate.

Output: code, files list, Phase 2 memory summary.
```

---

## Phase 2 — Testing & manual checklist

- Testing prompt: [../testing/phase-2-testing.md](../testing/phase-2-testing.md)
- Manual checklist: [../manual-testing/phase-2.md](../manual-testing/phase-2.md)
