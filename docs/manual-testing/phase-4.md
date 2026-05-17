# Phase 4 — Manual testing checklist

- [ ] Redis running; Celery worker running
- [ ] Forgot password → worker log shows email task; check inbox/spam for link
- [ ] Create admin → credentials email arrives
- [ ] Assign task → employee notification email with title/link
- [ ] API responses fast (email not blocking request)
- [ ] Simulate Brevo failure → Celery retries; error logged
