# Memory template (paste into “Previous context”)

After each step, Claude should output a summary like this. **Copy it** into the next prompt’s `Previous context` section.

```markdown
## Previous context (Step X.Y)

### What works
- [Bullet: e.g. Backend health at GET /api/health]
- [Bullet: e.g. Frontend login stores JWT and redirects to /dashboard]

### Files created/modified
- `path/to/file` — one-line purpose
- ...

### How to run locally
- Backend: `cd backend && ...`
- Frontend: `cd frontend && npm run dev`
- Other: MongoDB URI, seed command, Redis/Celery if applicable

### Env vars in use
- `MONGO_URI`, `JWT_SECRET_KEY`, ...

### Known gaps / TODO
- [Optional: anything deferred to a later step]
```

Keep summaries **short but complete** — the next step only needs enough to avoid redoing or breaking prior work.
