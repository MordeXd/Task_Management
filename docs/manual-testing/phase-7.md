# Phase 7 — Final deployment checklist

- [ ] systemd: taskflow-api, taskflow-celery, redis, nginx — active and enabled
- [ ] UFW: 22, 80, 443 only
- [ ] SSL valid; certbot renew dry-run OK
- [ ] `.env` permissions restricted (not world-readable)
- [ ] MongoDB authenticated; backups configured
- [ ] Log rotation configured
- [ ] `deploy.sh` pull/build/restart works
- [ ] Production smoke: login → admin → employee → task → email → complete
- [ ] Monitoring/alerts configured (optional Sentry/uptime)
