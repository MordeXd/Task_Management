# Frontend standards (include in every UI step)

Paste this block at the end of any frontend-heavy prompt if the model drifts:

```
Frontend rules (non-negotiable):
- TypeScript strict; no `any` unless justified.
- Mobile-first responsive layout (Tailwind: base styles, then sm/md/lg).
- shadcn/ui for primitives: Button, Input, Card, Label, Form, Dialog, Table, Sheet, Sonner, etc.
- Redux Toolkit: slices + createAsyncThunk; API via axios service module.
- Forms: react-hook-form + zod; inline errors via shadcn Form.
- Loading: disabled submit + spinner; list views use Skeleton.
- Success/error: Sonner toasts for user-visible outcomes.
- Accessible labels, focus states, touch targets ≥ 44px on mobile.
```

## Folder conventions

```
frontend/src/
  components/     # shared UI, layout, guards
  pages/          # route-level screens
  store/          # Redux store + slices
  services/       # api.ts (axios)
  lib/            # utils, cn()
  types/          # shared TS types
```

## Routing conventions

| Path | Roles |
|------|--------|
| `/login` | public |
| `/forgot-password`, `/reset-password/:token` | public |
| `/dashboard` | authenticated |
| `/super-admin` | super_admin |
| `/admin` | admin |
| `/my-tasks` | all authenticated (scoped by API) |
| `/team-tasks` | admin, super_admin |
| `/tasks/:id` | authenticated (permission via API) |
