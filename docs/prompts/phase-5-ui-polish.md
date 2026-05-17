# Phase 5: Modern UI/UX & State Management Polish

**Goal:** Production-ready shell, theme, forms, skeletons, redux-persist, toasts, error handling.

---

## Step 5.1 – Application shell layout

**Prompt:**

```
Phase 5, Step 5.1.

Previous context:
[Paste Phase 4 memory — or Phase 3 if email deferred]

Goal: DashboardLayout with sidebar navigation.

Frontend:
1. `components/layout/DashboardLayout.tsx` wraps all authenticated routes.
2. Sidebar links (lucide-react icons):
   - Dashboard, My Tasks, Team Tasks (admin+), Manage Users → /admin or /super-admin by role
3. Desktop: persistent sidebar; mobile: shadcn Sheet hamburger, overlay.
4. Top bar: page title/breadcrumb + existing user dropdown.
5. shadcn: Sidebar (or custom), Avatar, DropdownMenu, Sheet.
6. Redux `uiSlice`: sidebarOpen for mobile.
7. Refactor pages to use layout (remove duplicate headers).

Output: code, files list, memory block.

Frontend rules: TypeScript, mobile-first, shadcn/ui, Redux Toolkit.
```

---

## Step 5.2 – Design system & dark mode (optional)

**Prompt:**

```
Phase 5, Step 5.2.

Previous context:
[Paste memory from Step 5.1]

Goal: Theme tokens and optional dark mode.

Frontend:
1. Tailwind theme extension: primary/secondary, radius, shadows via CSS variables (shadcn compatible).
2. Dark mode: class on `html` toggled from Redux + localStorage (or next-themes pattern without Next.js).
3. `ThemeToggle` in top bar.
4. Spot-check Card, Button, Input, Table in dark mode.

Output: theme config, toggle component, files list, memory block.
```

---

## Step 5.3 – Form validation & UX

**Prompt:**

```
Phase 5, Step 5.3.

Previous context:
[Paste memory from Step 5.2]

Goal: Consistent forms app-wide.

Audit and fix:
- login, forgot, reset, change password
- add admin, add employee, edit user
- create/edit task

Each: react-hook-form + zod, shadcn Form inline errors, disabled submit + Loader2 on submit, Sonner on success, close/reset dialogs.

Output: modified forms, files list, memory block.
```

---

## Step 5.4 – Loading skeletons & empty states

**Prompt:**

```
Phase 5, Step 5.4.

Previous context:
[Paste memory from Step 5.3]

Goal: Skeletons and empty states on all lists.

Frontend:
1. shadcn Skeleton for My Tasks cards, Team Tasks table rows, user tables.
2. `EmptyState` component: illustration (SVG placeholder), message, CTA button where relevant.

Apply to: MyTasks, TeamTasks, SuperAdmin, Admin pages.

Output: components + integrations, files list, memory block.
```

---

## Step 5.5 – Redux-persist for auth state

**Prompt:**

```
Phase 5, Step 5.5.

Previous context:
[Paste memory from Step 5.4]

Goal: Persist auth slice across refresh.

Frontend:
1. redux-persist on `auth` only (token, user) — not passwords or reset tokens.
2. PersistGate in main.tsx.
3. logout: purge persisted storage.
4. Rehydrate: trust stored user or optionally call GET /api/auth/me.

Test: refresh while on /dashboard stays authenticated.

Output: store changes, files list, memory block.
```

---

## Step 5.6 – Toasts for all actions

**Prompt:**

```
Phase 5, Step 5.6.

Previous context:
[Paste memory from Step 5.5]

Goal: Sonner toasts on all meaningful CRUD.

1. Global `<Toaster />` in App if missing.
2. toast.success / toast.error in thunks or page handlers for: auth, users, tasks, password flows.

Output: thunk/page updates, files list, memory block.
```

---

## Step 5.7 – Error boundaries & 404 page

**Prompt:**

```
Phase 5, Step 5.7.

Previous context:
[Paste memory from Step 5.6]

Goal: Resilience and unknown routes.

Frontend:
1. class `ErrorBoundary` — fallback UI + reload button.
2. `NotFoundPage` — 404 with link to dashboard.
3. Router catch-all `*` → NotFoundPage.
4. Wrap app with ErrorBoundary.

Output: components, routing, files list, Phase 5 memory summary.
```

---

## Phase 5 — Testing & manual checklist

- [../testing/phase-5-testing.md](../testing/phase-5-testing.md)
- [../manual-testing/phase-5.md](../manual-testing/phase-5.md)
