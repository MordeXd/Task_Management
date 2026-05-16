# Phase 1 Test Plan - Foundation & Authentication

## Overview
This document outlines the test plan for Phase 1: Foundation & Authentication.

---

## PART 1: Backend Tests (Pytest)

### Run Tests
```bash
cd backend
venv\Scripts\python.exe -m pytest test_auth.py -v
```

### Test Results Summary
- **Total Tests:** 23
- **Passed:** 23
- **Failed:** 0

### Test Coverage by Endpoint

| Endpoint | Tests | Status |
|----------|-------|--------|
| `/api/auth/login` | 6 | ✅ Pass |
| `/api/auth/refresh` | 3 | ✅ Pass |
| `/api/auth/forgot-password` | 3 | ✅ Pass |
| `/api/auth/reset-password` | 5 | ✅ Pass |
| `/api/auth/change-password` | 4 | ✅ Pass |
| `/api/auth/me` | 2 | ✅ Pass |

---

## PART 2: Manual Frontend Testing Instructions

### Prerequisite
- Backend running on http://127.0.0.1:5000
- Frontend running on http://localhost:5173

---

### Test Case 1: User Login (Happy Path)
**Steps:**
1. Open http://localhost:5173/login
2. Enter email: `super@taskflow.com`
3. Enter password: `SuperAdmin123`
4. Click "Login" button
5. **Expected:** Redirect to Dashboard showing user email and role

---

### Test Case 2: Login with Invalid Credentials
**Steps:**
1. Open http://localhost:5173/login
2. Enter wrong email or password
3. Click "Login"
4. **Expected:** Error message displayed

---

### Test Case 3: Logout
**Steps:**
1. Login as super admin
2. Click "Logout" button in header
3. **Expected:** Redirect to Login page, user state cleared

---

### Test Case 4: Forgot Password Flow
**Steps:**
1. Go to http://localhost:5173/login
2. Click "Reset here" link
3. Enter email: `super@taskflow.com`
4. Click "Send Reset Link"
5. **Expected:** Success message shown
6. Check backend console for reset link (logged output)
7. Copy the reset link URL and open in browser
8. Enter new password and confirm
9. Click "Reset Password"
10. **Expected:** Success message, redirect to login

---

### Test Case 5: Change Password (Authenticated)
**Steps:**
1. Login as super admin
2. Click "Change Password" in header
3. Enter current password: `SuperAdmin123`
4. Enter new password: `NewPass123`
5. Confirm new password: `NewPass123`
6. Click "Change Password"
7. **Expected:** Success message, redirect to dashboard
8. Test login with new password works

---

### Test Case 6: Protected Routes
**Steps:**
1. Open http://localhost:5173/dashboard without login
2. **Expected:** Redirect to /login
3. Open http://localhost:5173/change-password without login
4. **Expected:** Redirect to /login

---

### Test Case 7: Token Refresh (Automatic)
**Steps:**
1. Login and stay on dashboard
2. Wait for access token to expire (1 hour)
3. Make an API request
4. **Expected:** Token automatically refreshed, request succeeds

---

### Test Case 8: Mobile Responsive Layout
**Steps:**
1. Resize browser to mobile width (< 768px)
2. Observe header shows hamburger menu
3. Click hamburger menu
4. **Expected:** Sheet opens with user menu

---

## Test Data
- **Super Admin User:** super@taskflow.com / SuperAdmin123
- **Role:** super_admin

---

## Error Cases Covered
- Invalid credentials
- Missing required fields
- Inactive user account
- Invalid/expired reset token
- Wrong old password on change
- Unauthorized access to protected routes