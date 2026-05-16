# Frontend Manual Testing Guide

## Phase 2: User Management Testing

### Prerequisites
- Backend server running on http://localhost:5000
- Frontend development server running on http://localhost:5173
- MongoDB running with test data

---

## Test Scenarios

### 1. Login & Authentication
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Login as Super Admin | 1. Go to `/login`<br>2. Enter `super@taskflow.com` / `SuperAdmin123`<br>3. Click Login | Redirect to dashboard, see Super Admin menu |
| Login as Admin | 1. Go to `/login`<br>2. Enter `admin@taskflow.com` / `Admin123`<br>3. Click Login | Redirect to dashboard, see Admin menu |
| Login as Employee | 1. Go to `/login`<br>2. Enter `employee@taskflow.com` / `Employee123`<br>3. Click Login | Redirect to dashboard, no admin menu |
| Invalid Login | 1. Enter wrong email/password<br>2. Click Login | Error toast: "Invalid email or password" |

---

### 2. Super Admin Page (`/super-admin`)

**Access:** Login as super_admin → Click "Admin" in navigation

#### Create Admin
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Create new admin | 1. Click "Add Admin" button<br>2. Enter email, name, password<br>3. Click "Create Admin" | Success toast, new admin appears in table |
| Create admin - duplicate email | 1. Use existing admin email<br>2. Try to create | Error: "User with this email already exists" |
| Create admin - short password | 1. Enter password < 6 chars<br>2. Try to create | Validation error: "Password must be at least 6 characters" |

#### Edit Admin
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Edit admin email | 1. Click pencil icon on admin<br>2. Change email<br>3. Save | Success toast, table updates |
| Edit admin password | 1. Click pencil icon<br>2. Enter new password<br>3. Save | Success toast, password updated |

#### Deactivate Admin
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Deactivate admin | 1. Click trash icon on admin<br>2. Confirm dialog | Success toast, status shows "Inactive" |
| Cannot deactivate self | 1. Try to deactivate own account | Error: "Cannot deactivate your own account" |

---

### 3. Admin Page (`/admin`)

**Access:** Login as admin → Click "Employees" in navigation

#### Create Employee
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Create new employee | 1. Click "Add Employee" button<br>2. Enter email, name, password<br>3. Click "Create Employee" | Success toast, new employee in table |
| Create employee - duplicate | 1. Use existing employee email<br>2. Try to create | Error toast: "User with this email already exists" |

#### Edit Employee
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Edit employee details | 1. Click pencil icon<br>2. Modify name/email<br>3. Save | Success toast, table updates |
| Change password | 1. Click pencil icon<br>2. Enter new password<br>3. Save | Success toast |

#### Deactivate Employee
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Deactivate employee | 1. Click trash icon<br>2. Confirm | Success toast, status shows "Inactive" |

---

### 4. Role Access Control

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Employee cannot access /admin | 1. Login as employee<br>2. Try to visit /admin | Redirect to error: "You don't have permission" |
| Employee cannot access /super-admin | 1. Login as employee<br>2. Try to visit /super-admin | Redirect to error: "You don't have permission" |
| Admin cannot access /super-admin | 1. Login as admin<br>2. Try to visit /super-admin | Redirect to error: "You don't have permission" |
| Employee cannot create admin | 1. Login as employee<br>2. Try POST to /api/company/admins | 403 Forbidden |
| Employee cannot create employee | 1. Login as employee<br>2. Try POST to /api/company/employees | 403 Forbidden |

---

### 5. UI/Responsive Testing

#### Desktop (1024px+)
- [ ] All tables display horizontally
- [ ] Dialogs centered properly
- [ ] Navigation shows all items

#### Tablet (768px - 1023px)
- [ ] Tables scroll horizontally
- [ ] Dialogs fit screen width
- [ ] Navigation collapses

#### Mobile (320px - 767px)
- [ ] Tables scroll horizontally
- [ ] Full-width dialogs
- [ ] Hamburger menu works
- [ ] Touch targets are 44px+

---

### 6. Toast Notifications
| Test | Steps | Expected Result |
|------|-------|-----------------|
| Success toast | Create admin/employee | Green toast: "Admin/Employee created successfully" |
| Error toast | Invalid input | Red toast: Error message |
| Toast auto-dismiss | Trigger any toast | Disappears after 3 seconds |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@taskflow.com | SuperAdmin123 |
| Admin | admin@taskflow.com | Admin123 |
| Employee | employee@taskflow.com | Employee123 |

---

## Quick Test Checklist

- [ ] Login works for all 3 roles
- [ ] Super Admin can create/edit/deactivate admins
- [ ] Admin can create/edit/deactivate employees
- [ ] Employee cannot access admin pages
- [ ] Dialogs open/close properly
- [ ] Toasts show on success/error
- [ ] Tables responsive on mobile