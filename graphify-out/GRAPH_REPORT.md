# Graph Report - Task_Management  (2026-05-16)

## Corpus Check
- 56 files · ~19,116 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 608 nodes · 926 edges · 50 communities (37 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ed790f3`
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
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 82 edges
2. `Button()` - 15 edges
3. `TestRoleAccess` - 10 edges
4. `User` - 10 edges
5. `Card()` - 10 edges
6. `CardHeader()` - 10 edges
7. `CardTitle()` - 10 edges
8. `CardDescription()` - 10 edges
9. `CardContent()` - 10 edges
10. `PART 2: Manual Frontend Testing Instructions` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ToastCard()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/toast.tsx → frontend/src/lib/utils.ts
- `Badge()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/badge.tsx → frontend/src/lib/utils.ts
- `Carousel()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/carousel.tsx → frontend/src/lib/utils.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/dialog.tsx → frontend/src/lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/sheet.tsx → frontend/src/lib/utils.ts

## Communities (50 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (53): Admin, adminSlice, AdminState, createAdmin, CreateAdminResponse, deactivateAdmin, fetchAdmins, initialState (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (45): cn(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia() (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (34): ApiErrorResponse, ChangePasswordForm, changePasswordSchema, ApiErrorResponse, ForgotPasswordForm, forgotPasswordSchema, LoginForm, loginSchema (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (33): create_app(), Seed script to create super_admin user if none exists. Run: python seed_superadm, Create super_admin user if not exists, seed_superadmin(), app(), auth_tokens(), Pytest test cases for backend auth endpoints. Run with: pytest test_auth.py -v, Test POST /api/auth/refresh (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (20): find_by_email(), find_by_email_exact(), find_by_id(), from_dict(), Save user to database, Save user to database, Save user to database, Save user to database (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (17): Test role-based access control, Test employee cannot access admin endpoints, Test role-based access control, Test employee cannot create admin, Test employee cannot access admin endpoints, Test employee cannot create admin, Test employee cannot create employee, Test employee cannot create employee (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (21): create_admin(), create_employee(), deactivate_user(), generate_temp_password(), get_admins(), get_db(), get_employees(), Get all employees for the user's company (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (19): code:bash (cd backend), Error Cases Covered, Overview, PART 1: Backend Tests (Pytest), PART 2: Manual Frontend Testing Instructions, Phase 1 Test Plan - Foundation & Authentication, Prerequisite, Run Tests (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (15): Test POST /api/auth/change-password, Test POST /api/auth/change-password, Test POST /api/auth/change-password, Test successful password change, Test successful password change, Test change password with wrong old password, Test change password with wrong old password, Test change password with wrong old password (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (13): Test POST /api/auth/reset-password, Test POST /api/auth/reset-password, Test successful password reset, Test successful password reset, Test reset with invalid token, Test reset with invalid token, Test reset with expired token, Test reset with expired token (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (14): Header(), logout, useAppDispatch(), LoginPage(), SuperAdminPage(), Sheet(), SheetContent(), SheetDescription() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (13): admin_tokens(), admin_user(), employee_tokens(), employee_user(), Pytest test cases for backend user management endpoints. Run with: pytest test_u, Get or create an employee for testing, Create valid tokens for employee, Get or create super admin user (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (9): Test POST /api/company/admins, Test super admin can create a new admin, Test create admin with missing email, Test create admin with missing password, Test create admin with short password, Test create admin with existing email, Test admin cannot create another admin, Test create admin without authentication (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (15): ApiError, ApiResponse, ButtonSize, ButtonVariant, CardProps, ChangePasswordData, DialogSize, ForgotPasswordData (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (8): Test login with missing password, Test login with inactive user, Test POST /api/auth/login, Test successful login returns tokens and user, Test login with non-existent email, Test login with wrong password, Test login with missing email, TestLogin

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (10): AdminPage(), store, Toaster(), Toast, ToastCard(), ToastContext, ToastContextType, ToastProvider() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (13): CreateEmployeeResponse, deactivateEmployee, Employee, employeeSlice, EmployeeState, fetchEmployees, initialState, updateEmployee (+5 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (7): Test PUT /api/company/users/<user_id>, Test admin can update user email, Test admin can update user name, Test admin can update user password, Test update non-existent user, Test update user without authentication, TestUpdateUser

### Community 18 - "Community 18"
Cohesion: 0.26
Nodes (10): change_password(), forgot_password(), get_db(), login(), me(), Change password for authenticated user, Generate password reset token and send email (simulated), Reset password using valid token (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.2
Nodes (6): Test POST /api/company/employees, Test admin can create a new employee, Test create employee with missing email, Test that only admin can create employees (not super_admin based on decorator), Test create employee without authentication, TestCreateEmployee

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (7): Test PATCH /api/company/users/<user_id>/deactivate, Test admin can deactivate a user, Test deactivate non-existent user, Test user cannot deactivate their own account, Test deactivate user without authentication, Test deactivate user without authentication, TestDeactivateUser

### Community 21 - "Community 21"
Cohesion: 0.2
Nodes (8): Form, FormControl, FormDescription, FormFieldProps, FormItem, FormLabel, FormMessage, FormProps

### Community 22 - "Community 22"
Cohesion: 0.2
Nodes (9): authSlice, AuthState, initialState, login, LoginResponse, User, AuthState, LoginCredentials (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.2
Nodes (8): { access_token }, api, CustomAxiosConfig, failedQueue, originalRequest, QueueItem, refreshToken, token

### Community 24 - "Community 24"
Cohesion: 0.28
Nodes (5): LocationState, RequireAuthProps, AppDispatch, AppDispatch, RootState

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (5): Test GET /api/company/employees, Test admin can list employees they created, Test super admin can list all employees, Test list employees without authentication, TestListEmployees

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (5): Test GET /api/company/admins, Test super admin can list all admins, Test admin cannot list admins, Test list admins without authentication, TestListAdmins

### Community 27 - "Community 27"
Cohesion: 0.38
Nodes (6): code:js (export default defineConfig([), code:js (// eslint.config.js), Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite, React + Vite

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (5): Celery application for background tasks (email, notifications, etc.), Simulated email sending task     In production, integrate with SendGrid, AWS SES, Send password reset email, send_email(), send_password_reset_email()

### Community 29 - "Community 29"
Cohesion: 0.7
Nodes (4): Config, DevConfig, ProdConfig, TestConfig

### Community 30 - "Community 30"
Cohesion: 0.5
Nodes (3): AppDispatch, RootState, store

### Community 31 - "Community 31"
Cohesion: 0.5
Nodes (3): Getting Started, Task Management Project, Tech Stack

## Knowledge Gaps
- **278 isolated node(s):** `Celery application for background tasks (email, notifications, etc.)`, `Simulated email sending task     In production, integrate with SendGrid, AWS SES`, `Send password reset email`, `Seed script to create super_admin user if none exists. Run: python seed_superadm`, `Create super_admin user if not exists` (+273 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 0`, `Community 2`, `Community 10`, `Community 15`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `app()` connect `Community 3` to `Community 11`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `cn()` (e.g. with `Badge()` and `Carousel()`) actually correct?**
  _`cn()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Celery application for background tasks (email, notifications, etc.)`, `Simulated email sending task     In production, integrate with SendGrid, AWS SES`, `Send password reset email` to the rest of the system?**
  _278 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._