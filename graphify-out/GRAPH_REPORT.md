# Graph Report - Task Management System  (2026-05-17)

## Corpus Check
- 105 files · ~26,662 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 513 nodes · 538 edges · 71 communities (45 shown, 26 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e532bb5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]

## God Nodes (most connected - your core abstractions)
1. `oid()` - 20 edges
2. `utcnow()` - 16 edges
3. `useAppDispatch()` - 15 edges
4. `cn()` - 15 edges
5. `Phase 7: AWS EC2 Deployment` - 10 edges
6. `serialize_doc()` - 9 edges
7. `TaskRepository` - 9 edges
8. `Phase 1: Foundation & Authentication` - 9 edges
9. `Phase 5: Modern UI/UX & State Management Polish` - 9 edges
10. `Phase 6: Security, Testing & Hardening` - 9 edges

## Surprising Connections (you probably didn't know these)
- `reset_password()` --calls--> `utcnow()`  [INFERRED]
  backend/app/routes/auth.py → backend/app/utils.py
- `complete_group_task()` --calls--> `utcnow()`  [INFERRED]
  backend/app/routes/group_tasks.py → backend/app/utils.py
- `delete_task()` --calls--> `can_modify_task()`  [INFERRED]
  backend/app/routes/tasks.py → backend/app/permissions.py
- `update_user()` --calls--> `user_belongs_to_company()`  [INFERRED]
  backend/app/routes/company.py → backend/app/permissions.py
- `deactivate_user()` --calls--> `user_belongs_to_company()`  [INFERRED]
  backend/app/routes/company.py → backend/app/permissions.py

## Communities (71 total, 26 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (13): oid(), serialize_doc(), utcnow(), CompanyRepository, to_public(), GroupTaskRepository, NotificationRepository, TaskRepository (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (24): useAppDispatch(), DashboardLayout(), navItems, NotificationBell(), NotificationItem, AdminPage(), schema, CompletedGroupTasksPage() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (20): cn(), Alert(), AlertDescription(), Badge(), badgeVariants, Card, CardContent(), CardDescription() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (15): can_complete_task(), can_modify_task(), can_view_task(), same_company(), complete_task(), create_task(), delete_task(), get_task() (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (15): user_belongs_to_company(), generate_temp_password(), create_admin(), create_employee(), deactivate_user(), list_admins(), list_employees(), _resolve_company_id() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): code:block1 (Phase 7, Step 7.1.), code:block2 (Phase 7, Step 7.2.), code:block3 (Phase 7, Step 7.3.), code:block4 (Phase 7, Step 7.4.), code:block5 (Phase 7, Step 7.5.), code:block6 (Phase 7, Step 7.6.), code:block7 (Phase 7, Step 7.7.), code:block8 (Phase 7, Step 7.8.) (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (16): 1. Backend, 2. Frontend, 3. Login, Build prompts, code:powershell (cd backend), code:powershell (cd frontend), code:powershell (# Terminal: Redis running, then), code:block4 (backend/          Flask API) (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (16): code:block1 (Phase 5, Step 5.1.), code:block2 (Phase 5, Step 5.2.), code:block3 (Phase 5, Step 5.3.), code:block4 (Phase 5, Step 5.4.), code:block5 (Phase 5, Step 5.5.), code:block6 (Phase 5, Step 5.6.), code:block7 (Phase 5, Step 5.7.), Phase 5: Modern UI/UX & State Management Polish (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (16): code:block1 (Phase 6, Step 6.1.), code:block2 (Phase 6, Step 6.2.), code:block3 (Phase 6, Step 6.3.), code:block4 (Phase 6, Step 6.4.), code:block5 (Phase 6, Step 6.5.), code:block6 (Phase 6, Step 6.6.), code:block7 (Phase 6, Step 6.7.), Phase 6: Security, Testing & Hardening (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (15): code:block1 (We are building a multi-tenant task management SaaS (TaskFlo), code:block2 (Phase 1, Step 1.2.), code:block3 (Phase 1, Step 1.3.), code:block4 (Phase 1, Step 1.4.), code:block5 (Phase 1, Step 1.5.), code:block6 (Phase 1, Step 1.6.), Phase 1: Foundation & Authentication, Phase 1 — Manual checklist (for you) (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (6): forgot_password(), login(), refresh(), reset_password(), _tokens_for_user(), send_password_reset_email()

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (12): code:block1 (Phase 3, Step 3.1.), code:block2 (Phase 3, Step 3.2.), code:block3 (Phase 3, Step 3.3.), code:block4 (Phase 3, Step 3.4.), code:block5 (Phase 3, Step 3.5.), Phase 3: Task Management Core, Phase 3 — Testing & manual checklist, Step 3.1 – Task model & backend CRUD skeleton (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (5): init_mongo(), create_app(), Seed demo company and super admin user., seed(), app()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (10): code:block1 (Phase 2, Step 2.0.), code:block2 (Phase 2, Step 2.1.), code:block3 (Phase 2, Step 2.2.), code:block4 (Phase 2, Step 2.3.), Phase 2: Company & User Management (Role Hierarchy), Phase 2 — Testing & manual checklist, Step 2.0 – Company model (prerequisite), Step 2.1 – Super-Admin: Create & list Admins (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (10): code:block1 (Phase 4, Step 4.1.), code:block2 (Phase 4, Step 4.2.), code:block3 (Phase 4, Step 4.3.), code:block4 (Phase 4, Step 4.4.), Phase 4: Asynchronous Email Notifications, Phase 4 — Testing & manual checklist, Step 4.1 – Setup Celery & Redis, Step 4.2 – Wire up existing email triggers (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.2
Nodes (9): completeTask, createTask, deleteTask, fetchTaskById, fetchTasks, initialState, tasksSlice, TasksState (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (9): createAdmin, createEmployee, deactivateUser, fetchAdmins, fetchEmployees, initialState, updateUser, usersSlice (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.2
Nodes (9): completeGroupTask, createGroupTask, deleteGroupTask, fetchGroupTaskById, fetchGroupTasks, groupTasksSlice, GroupTasksState, initialState (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (8): Attachment, GroupTask, Notification, NotificationType, Task, TaskLink, User, UserRole

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (7): fetchNotifications, fetchUnreadCount, initialState, markAllAsRead, markAsRead, notificationsSlice, NotificationsState

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): AppDispatch, RootState, store, initialState, uiSlice, UiState

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (5): authSlice, AuthState, initialState, login, stored

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (7): How to use, Local URLs (defaults), Notes for Claude sessions, Prompt index, Seeded super admin (after Step 1.2), Stack (enforced in every frontend step), TaskFlow — Claude step-by-step build guide

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (3): ErrorBoundary, Props, State

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (5): code:block1 (Frontend rules (non-negotiable):), code:block2 (frontend/src/), Folder conventions, Frontend standards (include in every UI step), Routing conventions

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (5): code:js (export default defineConfig([), code:js (// eslint.config.js), Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 30 - "Community 30"
Cohesion: 0.5
Nodes (3): Button, ButtonProps, buttonVariants

## Knowledge Gaps
- **164 isolated node(s):** `Seed demo company and super admin user.`, `Config`, `ImportMetaEnv`, `ImportMeta`, `Props` (+159 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `utcnow()` connect `Community 0` to `Community 10`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `oid()` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `complete_task()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `oid()` (e.g. with `.find_by_id()` and `.find_by_id()`) actually correct?**
  _`oid()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `utcnow()` (e.g. with `.create()` and `.create()`) actually correct?**
  _`utcnow()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `useAppDispatch()` (e.g. with `DashboardLayout()` and `NotificationBell()`) actually correct?**
  _`useAppDispatch()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `cn()` (e.g. with `Alert()` and `AlertDescription()`) actually correct?**
  _`cn()` has 14 INFERRED edges - model-reasoned connections that need verification._