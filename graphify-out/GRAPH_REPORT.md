# Graph Report - Task_Management  (2026-05-16)

## Corpus Check
- 44 files · ~10,538 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 310 nodes · 411 edges · 31 communities (26 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f93a49a`
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
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `User` - 10 edges
2. `TestLogin` - 8 edges
3. `TestResetPassword` - 8 edges
4. `TestChangePassword` - 8 edges
5. `cn()` - 8 edges
6. `get_db()` - 7 edges
7. `Button` - 7 edges
8. `Card` - 7 edges
9. `CardHeader` - 7 edges
10. `CardTitle` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ToastCard()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/toast.tsx → frontend/src/lib/utils.ts
- `Carousel()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/carousel.tsx → frontend/src/lib/utils.ts
- `CarouselItem()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/carousel.tsx → frontend/src/lib/utils.ts
- `seed_superadmin()` --calls--> `create_app()`  [INFERRED]
  backend/seed_superadmin.py → backend/app/__init__.py
- `app()` --calls--> `create_app()`  [INFERRED]
  backend/test_auth.py → backend/app/__init__.py

## Communities (31 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (26): ChangePasswordForm, changePasswordSchema, ForgotPasswordForm, forgotPasswordSchema, LoginForm, loginSchema, ResetPasswordForm, resetPasswordSchema (+18 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (16): create_app(), Seed script to create super_admin user if none exists. Run: python seed_superadm, Create super_admin user if not exists, seed_superadmin(), app(), auth_tokens(), Pytest test cases for backend auth endpoints. Run with: pytest test_auth.py -v, Test login with missing password (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (12): find_by_email(), find_by_email_exact(), find_by_id(), from_dict(), Save user to database, Hash and set the password, Hash and set the reset token, Verify the reset token (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (16): RequireAuthProps, authSlice, AuthState, initialState, login, logout, User, api (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (14): cn(), Badge(), BadgeProps, badgeVariants, Carousel(), CarouselItem(), CarouselProps, DropdownMenuContent (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (15): Test POST /api/auth/change-password, Test POST /api/auth/change-password, Test POST /api/auth/change-password, Test successful password change, Test successful password change, Test change password with wrong old password, Test change password with wrong old password, Test change password with wrong old password (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (13): Test POST /api/auth/reset-password, Test POST /api/auth/reset-password, Test successful password reset, Test successful password reset, Test reset with invalid token, Test reset with invalid token, Test reset with expired token, Test reset with expired token (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (10): Sheet(), SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetProps (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (9): Test POST /api/auth/forgot-password, Test POST /api/auth/forgot-password, Test forgot password for existing user, Test forgot password for existing user, Test forgot password for non-existent user (should not reveal), Test forgot password for non-existent user (should not reveal), Test forgot password with missing email, Test forgot password with missing email (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (10): change_password(), forgot_password(), get_db(), login(), me(), Change password for authenticated user, Generate password reset token and send email (simulated), Reset password using valid token (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.2
Nodes (9): Test GET /api/auth/me, Test GET /api/auth/me, Test GET /api/auth/me, Test getting current user info, Test getting current user info, Test getting user info without auth, Test getting user info without auth, Test getting user info without auth (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (8): DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogProps, DialogTitle, DialogTrigger

### Community 12 - "Community 12"
Cohesion: 0.2
Nodes (8): Form, FormControl, FormDescription, FormFieldProps, FormItem, FormLabel, FormMessage, FormProps

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (6): Test POST /api/auth/refresh, Test successful token refresh, Test refresh with invalid token, Test using access token for refresh (should fail), Test using access token for refresh (should fail), TestRefreshToken

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 15 - "Community 15"
Cohesion: 0.25
Nodes (7): Toast, ToastCard(), ToastContext, ToastContextType, ToastProvider(), useToast(), useToastHook()

### Community 16 - "Community 16"
Cohesion: 0.38
Nodes (6): code:js (export default defineConfig([), code:js (// eslint.config.js), Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite, React + Vite

### Community 17 - "Community 17"
Cohesion: 0.4
Nodes (5): Celery application for background tasks (email, notifications, etc.), Simulated email sending task     In production, integrate with SendGrid, AWS SES, Send password reset email, send_email(), send_password_reset_email()

### Community 18 - "Community 18"
Cohesion: 0.7
Nodes (4): Config, DevConfig, ProdConfig, TestConfig

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (4): Select, SelectContent, SelectItem, SelectTrigger

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (3): Getting Started, Task Management Project, Tech Stack

## Knowledge Gaps
- **146 isolated node(s):** `Celery application for background tasks (email, notifications, etc.)`, `Simulated email sending task     In production, integrate with SendGrid, AWS SES`, `Send password reset email`, `Seed script to create super_admin user if none exists. Run: python seed_superadm`, `Create super_admin user if not exists` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TestChangePassword` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `TestResetPassword` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `cn()` (e.g. with `Badge()` and `Carousel()`) actually correct?**
  _`cn()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Celery application for background tasks (email, notifications, etc.)`, `Simulated email sending task     In production, integrate with SendGrid, AWS SES`, `Send password reset email` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._