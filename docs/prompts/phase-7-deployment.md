# Phase 7: AWS EC2 Deployment

**Goal:** Single EC2 instance — Nginx, Gunicorn, systemd, Redis, MongoDB (local or Atlas).

---

## Step 7.1 – Provision EC2 & install dependencies

**Prompt:**

```
Phase 7, Step 7.1.

Previous context:
[Paste Phase 6 memory — app tested locally, pytest passing]

Goal: EC2 bootstrap commands (no app code changes).

Deliver a shell script `scripts/ec2-bootstrap.sh` with exact commands for:
- Ubuntu 24.04 LTS, Elastic IP, SG ports 22/80/443
- Node.js 24 LTS (NodeSource), Python 3.12+ venv (use stable Python; note if 3.14 unavailable on Ubuntu)
- Redis, Nginx, Git
- Clone repo to /home/ubuntu/taskflow
- backend venv + pip install -r requirements.txt
- frontend npm ci && npm run build → /var/www/taskflow/frontend
- curl http://127.0.0.1:5000/api/health after manual python run.py test

Output: script + README section, files list.
```

---

## Step 7.2 – Configure environment & MongoDB

**Prompt:**

```
Phase 7, Step 7.2.

Previous context:
[Paste memory from Step 7.1]

Goal: Production .env and MongoDB.

Deliver commands/docs for:
1. /home/ubuntu/taskflow/backend/.env — MONGO_URI, JWT_SECRET_KEY, BREVO_API_KEY, CORS_ORIGINS (production domain), REDIS_URL
2. MongoDB Atlas OR local mongod with auth
3. Run seed for super_admin
4. Verify connection

Output: .env.production.example, commands, memory block.
```

---

## Step 7.3 – Gunicorn & systemd for Flask

**Prompt:**

```
Phase 7, Step 7.3.

Previous context:
[Paste memory from Step 7.2]

Goal: systemd service for API.

Deliver:
- `/etc/systemd/system/taskflow-api.service`
- gunicorn bind 127.0.0.1:5000, workers 3
- enable/start commands
- journalctl troubleshooting one-liners

Output: service file content + commands, memory block.
```

---

## Step 7.4 – Celery worker systemd

**Prompt:**

```
Phase 7, Step 7.4.

Previous context:
[Paste memory from Step 7.3]

Goal: Celery systemd unit.

Deliver:
- `/etc/systemd/system/taskflow-celery.service`
- EnvironmentFile to .env
- After redis.service
- enable/start commands

Output: service file + commands, memory block.
```

---

## Step 7.5 – Nginx reverse proxy & static files

**Prompt:**

```
Phase 7, Step 7.5.

Previous context:
[Paste memory from Step 7.4]

Goal: Nginx config.

- /api/ → proxy_pass http://127.0.0.1:5000
- / → root /var/www/taskflow/frontend, try_files for SPA routing
- site enable, nginx -t, reload

Output: full site config + commands, memory block.
```

---

## Step 7.6 – SSL with Let's Encrypt (if domain)

**Prompt:**

```
Phase 7, Step 7.6.

Previous context:
[Paste memory from Step 7.5]

Goal: HTTPS with certbot (only if user has domain).

Commands:
- certbot --nginx -d yourdomain.com
- auto-renewal test
- HTTP → HTTPS redirect

Output: command list, memory block.
```

---

## Step 7.7 – Deployment script

**Prompt:**

```
Phase 7, Step 7.7.

Previous context:
[Paste memory from Step 7.6]

Goal: `deploy.sh` at repo root.

Steps in script:
- git pull
- pip install -r requirements.txt
- npm ci && npm run build && rsync/cp to /var/www/taskflow/frontend
- restart taskflow-api, taskflow-celery
- reload nginx
- print health check curl

Make executable. Document usage.

Output: deploy.sh, files list, memory block.
```

---

## Step 7.8 – Final smoke test & go live

**Prompt:**

```
Phase 7, Step 7.8.

Previous context:
[Paste memory from Step 7.7 — production deployed]

Goal: Go-live verification checklist (no code).

Deliver markdown checklist:
1. Login super_admin on production URL
2. Create admin → login as admin → create employee → assign task
3. Employee completes task, email received
4. Password reset E2E
5. Mobile responsive spot check
6. systemd services enabled, UFW, SSL, backups note

Output: docs/GO-LIVE-CHECKLIST.md
```

---

## Phase 7 — Production readiness

- [../testing/phase-7-production-readiness.md](../testing/phase-7-production-readiness.md)
- [../manual-testing/phase-7.md](../manual-testing/phase-7.md)
