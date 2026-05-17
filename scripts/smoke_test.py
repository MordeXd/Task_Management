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
count_429 = 0
for _ in range(7):
    r = requests.post(f"{BASE}/api/auth/login", json={"email": "nobody@x.com", "password": "wrong"}, timeout=5)
    if r.status_code == 429:
        count_429 += 1
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
