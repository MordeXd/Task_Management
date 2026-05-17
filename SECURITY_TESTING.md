# Security Testing Guide — TaskFlow

## 1. Rate Limiting

### 1.1 Login (5/min per IP)
```bash
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"bad@test.com","password":"wrong"}'
done
# Expected: 200, 200, 200, 200, 200, 429
```

### 1.2 Forgot Password (3/hr per email)
```bash
EMAIL="test@example.com"
for i in $(seq 1 4); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\"}"
done
# Expected: 200, 200, 200, 429
```

### 1.3 Reset Password (5/min per IP)
```bash
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/auth/reset-password \
    -H "Content-Type: application/json" \
    -d '{"token":"bad","password":"NewPass123!"}'
done
# Expected: 200, 200, 200, 200, 200, 429
```

### 1.4 General API (100/min per user)
```python
import requests
token = "eyJ..."  # valid JWT
headers = {"Authorization": f"Bearer {token}"}
for i in range(101):
    r = requests.get("http://localhost:5000/api/tasks", headers=headers)
    if r.status_code == 429:
        print(f"Rate limited at request {i+1}")
        print(f"Retry-After: {r.headers.get('Retry-After')}")
        break
```

### 1.5 Verify Retry-After Header
```bash
curl -s -D - -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"x@y.com","password":"wrong"}' \
  2>&1 | head -20
# After hitting limit, expect: HTTP/1.1 429 TOO MANY REQUESTS
#                           Retry-After: 60
```

---

## 2. Expired / Revoked Tokens

### 2.1 Use Expired Access Token
```bash
# Wait 15+ min after getting a token, or forge an expired one
curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:5000/api/tasks \
  -H "Authorization: Bearer EXPIRED_TOKEN"
# Expected: 422 (unprocessable — token expired)
```

### 2.2 Use Revoked Refresh Token (after logout)
```python
import requests

BASE = "http://localhost:5000"
# Login
r = requests.post(f"{BASE}/api/auth/login", json={"email": "admin@test.com", "password": "Pass123!"})
data = r.json()
refresh = data["refresh_token"]

# Logout (blacklists this refresh token)
requests.post(f"{BASE}/api/auth/logout", headers={"Authorization": f"Bearer {refresh}"})

# Try to refresh with the blacklisted token
r = requests.post(f"{BASE}/api/auth/refresh", headers={"Authorization": f"Bearer {refresh}"})
assert r.status_code == 401
print("Revoked token rejected: OK")
```

### 2.3 Access Without Token
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/tasks
# Expected: 401
```

### 2.4 Access With Invalid Token Format
```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:5000/api/tasks \
  -H "Authorization: Bearer not-a-valid-jwt"
# Expected: 422
```

---

## 3. Role Escalation Attempts

### 3.1 Employee Creates Task
```python
import requests
BASE = "http://localhost:5000"

# Login as employee
r = requests.post(f"{BASE}/api/auth/login", json={"email": "emp@test.com", "password": "Pass123!"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Try creating a task
r = requests.post(f"{BASE}/api/tasks", headers=headers, json={
    "title": "Escalate", "assigned_to": "another_user_id"
})
print(r.status_code)  # Expected: 403
```

### 3.2 Admin Creates Super Admin
```python
r = requests.post(f"{BASE}/api/company/admins", headers=headers, json={
    "name": "Fake Super", "email": "fake@test.com"
})
print(r.status_code)  # Expected: 403 (admin role not in require_roles)
```

### 3.3 Employee Reads Admin-Only Route
```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:5000/api/company/employees \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
# Expected: 403
```

### 3.4 Admin Reads Employee From Different Company
```python
# Requires two companies in DB
r = requests.get(f"{BASE}/api/company/employees", headers=admin_headers_a)
data = r.json()
emp_from_company_b = data["employees"][0] if data["employees"] else None
# The list should only contain employees from the admin's own company
```

### 3.5 Cross-Company Task Access
```python
# Attempt to complete a task from another company
task_id = "task_in_company_b"
r = requests.patch(f"{BASE}/api/tasks/{task_id}/complete", headers=admin_headers_a)
print(r.status_code)  # Expected: 404 (can't even see it)
```

### 3.6 Cross-Company Group Task Access
```python
for endpoint in ["", f"/{task_id}", f"/{task_id}/complete"]:
    r = requests.get(f"{BASE}/api/group-tasks{endpoint}", headers=admin_headers_a)
    assert r.status_code != 200 or r.json() != group_task_from_b
```

---

## 4. Input Validation

### 4.1 Password Complexity
```bash
# Too short
curl -s http://localhost:5000/api/auth/reset-password \
  -X POST -H "Content-Type: application/json" \
  -d '{"token":"x","password":"Ab1!"}'
# Expected: 400 "Password must be at least 8 characters"

# Missing uppercase
curl -s http://localhost:5000/api/auth/reset-password \
  -X POST -H "Content-Type: application/json" \
  -d '{"token":"x","password":"abcdef1!@3456"}'
# Expected: 400 "Password must include uppercase..."

# Missing special char
curl -s http://localhost:5000/api/auth/reset-password \
  -X POST -H "Content-Type: application/json" \
  -d '{"token":"x","password":"Abcdefgh1"}'
# Expected: 400 "Password must include uppercase..."
```

### 4.2 Task Input Validation
```bash
# Missing title
curl -s http://localhost:5000/api/tasks \
  -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"assigned_to":"some_id"}'
# Expected: 400 "Title and assigned_to are required"

# Invalid priority
curl -s http://localhost:5000/api/tasks \
  -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"title":"Test","assigned_to":"some_id","priority":"critical"}'
# Expected: 400 "Invalid priority"
```

### 4.3 User Email Validation
```bash
curl -s http://localhost:5000/api/company/employees \
  -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name":"Test","email":"not-an-email"}'
# Expected: 400 (if backend validates) or 409 (mongodb unique constraint — should still fail)
```

### 4.4 Self-Assignment Prevention
```bash
curl -s http://localhost:5000/api/tasks \
  -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"title":"Self","assigned_to":"ADMIN_USER_ID"}'
# Expected: 400 "Cannot assign task to yourself"
```

### 4.5 Group Task Minimum Members
```bash
curl -s http://localhost:5000/api/group-tasks \
  -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"title":"Group","assigned_to":["one_id"]}'
# Expected: 400 "At least 2 assignees required"
```

### 4.6 File Upload Validation
```bash
# Wrong extension
curl -s http://localhost:5000/api/upload/TASK_ID/pdf \
  -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@malware.exe"
# Expected: 400 "Invalid file type for pdf"
```

---

## 5. CORS

### 5.1 Allowed Origin
```bash
curl -s -D - -o /dev/null \
  http://localhost:5000/api/health \
  -H "Origin: http://localhost:5173"
# Expected: Access-Control-Allow-Origin: http://localhost:5173
```

### 5.2 Disallowed Origin
```bash
curl -s -D - -o /dev/null \
  http://localhost:5000/api/health \
  -H "Origin: https://evil.com"
# Expected: NO Access-Control-Allow-Origin header (response blocked by browser)
```

### 5.3 Preflight Request
```bash
curl -s -D - -o /dev/null \
  -X OPTIONS http://localhost:5000/api/tasks \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type"
# Expected: Access-Control-Allow-Methods: ...
#           Access-Control-Allow-Headers: Authorization, Content-Type
#           status: 200
```

### 5.4 Credentials Header
```bash
curl -s -D - -o /dev/null \
  http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:5173"
# Expected: Access-Control-Allow-Credentials: true
```

---

## 6. Smoke Test Script

Create `scripts/smoke_test.py` and run after every deployment:

<details>
<summary><code>scripts/smoke_test.py</code></summary>

```python
#!/usr/bin/env python3
"""Post-deployment smoke test. Run: python scripts/smoke_test.py [BASE_URL]"""

import sys
import requests

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
pass_count = 0
fail_count = 0


def check(label, condition, detail=""):
    global pass_count, fail_count
    if condition:
        pass_count += 1
        print(f"  PASS  {label}")
    else:
        fail_count += 1
        print(f"  FAIL  {label}  {detail}")


print(f"\n=== Smoke Test: {BASE} ===\n")

# 1. Health
r = requests.get(f"{BASE}/api/health", timeout=5)
check("Health endpoint", r.status_code == 200 and r.json().get("status") == "ok")

# 2. CORS headers
r = requests.get(f"{BASE}/api/health", headers={"Origin": "http://localhost:5173"})
check("CORS allowed origin", "Access-Control-Allow-Origin" in r.headers)
check("CORS credentials", r.headers.get("Access-Control-Allow-Credentials") == "true")

# 3. Login failure
r = requests.post(f"{BASE}/api/auth/login", json={"email": "noone@test.com", "password": "wrong"}, timeout=5)
check("Login failure returns 401", r.status_code == 401)

# 4. Unauthenticated access blocked
r = requests.get(f"{BASE}/api/tasks", timeout=5)
check("No-token access blocked", r.status_code == 401)

# 5. Forgot password (successful even for missing email — no user enumeration)
r = requests.post(f"{BASE}/api/auth/forgot-password", json={"email": "noone@test.com"}, timeout=5)
check("Forgot password returns 200 (no enumeration)", r.status_code == 200)
msg = r.json().get("message", "")
check("Forgot password message is vague", "sent" in msg.lower())

# 6. Password validation on reset
r = requests.post(f"{BASE}/api/auth/reset-password", json={"token": "x", "password": "short"}, timeout=5)
check("Short password rejected", r.status_code == 400)
r = requests.post(f"{BASE}/api/auth/reset-password", json={"token": "x", "password": "nouppercase1!"}, timeout=5)
check("Password without uppercase rejected", r.status_code == 400)
r = requests.post(f"{BASE}/api/auth/reset-password", json={"token": "x", "password": "NoSpecialChar1"}, timeout=5)
check("Password without special char rejected", r.status_code == 400)

# 7. Rate limiting (login)
count_200 = 0
count_429 = 0
for _ in range(7):
    r = requests.post(f"{BASE}/api/auth/login", json={"email": "nobody@x.com", "password": "wrong"}, timeout=5)
    if r.status_code == 429:
        count_429 += 1
    elif r.status_code == 200:
        count_200 += 1
check("Rate limit triggers 429", count_429 >= 1)
if count_429:
    check("Retry-After header present", r.headers.get("Retry-After") is not None)

# 8. CORS preflight
r = requests.options(
    f"{BASE}/api/tasks",
    headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization,Content-Type",
    },
    timeout=5,
)
check("Preflight succeeds", r.status_code == 200)

# 9. Disallowed origin blocked
r = requests.get(f"{BASE}/api/health", headers={"Origin": "https://evil.com"})
check("Evil origin does not get ACAO", "Access-Control-Allow-Origin" not in r.headers or r.headers["Access-Control-Allow-Origin"] == "null")

# 10. 404 for unknown routes
r = requests.get(f"{BASE}/api/nonexistent", timeout=5)
check("Unknown route returns 404", r.status_code == 404)

print(f"\n=== Results: {pass_count} passed, {fail_count} failed ===\n")
sys.exit(1 if fail_count else 0)
```
</details>

### How to Run
```bash
# Point at any environment
python scripts/smoke_test.py http://localhost:5000
python scripts/smoke_test.py https://staging.taskflow.app
python scripts/smoke_test.py https://taskflow.app
```

---

## 7. Testing Checklist Summary

| Category | Tests | Priority |
|----------|-------|----------|
| Rate limiting | 5 scenarios (login, forgot, reset, general, Retry-After) | High |
| Token security | Expired, revoked, missing, malformed | High |
| Role escalation | 6 scenarios (employee→create, admin→create_admin, cross-company, etc.) | High |
| Input validation | 6 scenarios (password, task, email, self-assign, group members, file upload) | Medium |
| CORS | 4 scenarios (allowed, disallowed, preflight, credentials) | Medium |
| Smoke test | 10 automated checks | Critical |
