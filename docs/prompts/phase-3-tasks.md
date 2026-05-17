# Phase 3: Task Management Core

**Goal:** Admins assign tasks; assignees and admins can complete; employees see only their tasks.

> **Note:** If using Claude Code CLI with a long session, you may resume with `claude --resume <session-id>`. In Cursor, paste Previous context instead.

---

## Step 3.1 – Task model & backend CRUD skeleton

**Prompt:**

```
Phase 3, Step 3.1.

Previous context:
[Paste Phase 2 completion memory — user management, roles, company scoping]

Goal: Task model, permission helpers, CRUD API, Redux tasksSlice (no task UI yet).

Backend:
1. Task fields:
   - title (required), description (optional)
   - status: pending | completed (default pending)
   - priority: low | medium | high (optional)
   - due_date (datetime, optional)
   - assigned_to, assigned_by (User refs)
   - company_id
   - completed_at, completed_by (nullable)
   - created_at, updated_at
2. Protected endpoints:
   - GET /api/tasks — company scoped; employee sees only assigned_to=self
   - POST /api/tasks — admin/super_admin only; assign employee in same company
   - GET /api/tasks/:id
   - PUT /api/tasks/:id — admin/super_admin
   - PATCH /api/tasks/:id/complete — assignee OR admin/super_admin of company
3. Helpers: can_view_task, can_modify_task, can_complete_task

Frontend:
1. `store/tasksSlice.ts` — types Task, CreateTaskPayload, UpdateTaskPayload
2. Thunks: fetchTasks, createTask, updateTask, completeTask
3. Wire to api.ts; no pages yet

Output: all code, files list, memory block.
```

---

## Step 3.2 – Employee task view

**Prompt:**

```
Phase 3, Step 3.2.

Previous context:
[Paste memory from Step 3.1]

Goal: My Tasks page for assignees.

Frontend:
1. `MyTasksPage` at `/my-tasks` — authenticated; API scopes list.
2. Card grid: 1 col mobile, 2 tablet, 3 desktop — title, status Badge, priority, due date, “Mark Complete”.
3. shadcn Skeleton while loading; empty state “No tasks assigned yet”.
4. Filter bar: All | Pending | Completed (local state or search params).
5. Mark Complete → PATCH complete → update Redux or refetch.

Backend:
- GET /api/tasks includes assigned user name/email for display.

Output: code, files list, memory block.

Frontend rules: TypeScript, mobile-first, shadcn/ui, Redux Toolkit.
```

---

## Step 3.3 – Admin task creation & team view

**Prompt:**

```
Phase 3, Step 3.3.

Previous context:
[Paste memory from Step 3.2]

Goal: Team tasks for admin/super_admin.

Frontend:
1. `TeamTasksPage` at `/team-tasks` — role guard admin + super_admin.
2. shadcn Table: Title, Assigned To, Status, Priority, Due Date, Actions.
3. Employee filter Select (active employees from usersSlice).
4. Create Task Dialog — react-hook-form + zod: title, description, priority, due date, assigned_to.
5. Edit Task Dialog — pre-filled PUT on submit.
6. Mobile: scrollable table; dialog near full-screen on sm.

Backend:
- POST /api/tasks returns populated assigned user.
- GET /api/company/employees returns active employees only.

Redux: ensure createTask/updateTask thunks used.

Output: code, files list, memory block.
```

---

## Step 3.4 – Task detail & completion flow

**Prompt:**

```
Phase 3, Step 3.4.

Previous context:
[Paste memory from Step 3.3]

Goal: Task detail page and polished completion UX.

Frontend:
1. `TaskDetailPage` at `/tasks/:id` — full task info, Mark Complete if allowed, show completed_by/at when done.
2. Back navigation to prior list.
3. MyTasks and TeamTasks: click row/card → detail.
4. After complete: toast + navigate back.

Backend:
- GET /api/tasks/:id populates assigned_to and assigned_by names.
- PATCH complete returns full updated task.

Redux: optional `fetchTaskById` thunk.

Output: code, files list, memory block.
```

---

## Step 3.5 – Super-Admin full visibility

**Prompt:**

```
Phase 3, Step 3.5.

Previous context:
[Paste memory from Step 3.4]

Goal: Confirm super_admin permissions across company tasks.

Backend:
- super_admin: GET /api/tasks and GET /api/tasks/:id for any task in their company context (MVP: same company as demo; document if super_admin is global later).
- admin: all company tasks (MVP: all employees in company).

Frontend:
- TeamTasksPage: subtle label for role if helpful; no major new UI.

Output: **only necessary diffs**, files list, Phase 3 memory summary.
```

---

## Phase 3 — Testing & manual checklist

- [../testing/phase-3-testing.md](../testing/phase-3-testing.md)
- [../manual-testing/phase-3.md](../manual-testing/phase-3.md)
