// =============================================================================
// User & Authentication Types
// =============================================================================

/** User roles in the system */
export type UserRole = 'super_admin' | 'admin' | 'employee'

/** Authenticated user object */
export interface User {
  id: string
  email: string
  role: UserRole
  company_id: string | null
}

/** Login credentials */
export interface LoginCredentials {
  email: string
  password: string
}

/** Login response data */
export interface LoginResponse {
  user: User
  access_token: string
  refresh_token: string
}

/** Auth state in Redux store */
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

// =============================================================================
// Company & Admin Types
// =============================================================================

/** Admin user in the system */
export interface Admin {
  _id: string
  email: string
  name: string | null
  role: UserRole
  company_id: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

/** Admin state in Redux store */
export interface AdminState {
  admins: Admin[]
  loading: boolean
  error: string | null
  successMessage: string | null
}

/** Data for creating a new admin */
export interface CreateAdminData {
  email: string
  password: string
  name?: string
}

// =============================================================================
// Employee Types
// =============================================================================

/** Employee user in the system */
export interface Employee {
  _id: string
  email: string
  name: string | null
  role: UserRole
  company_id: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

/** Employee state in Redux store */
export interface EmployeeState {
  employees: Employee[]
  loading: boolean
  error: string | null
  successMessage: string | null
}

/** Data for creating a new employee */
export interface CreateEmployeeData {
  email: string
  password: string
  name?: string
}

// =============================================================================
// API Response Types
// =============================================================================

/** Generic API error response */
export interface ApiError {
  message: string
  status?: number
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T
  message?: string
}

// =============================================================================
// Redux Store Types
// =============================================================================

/** Root state for Redux store */
export interface RootState {
  auth: AuthState
  admin: AdminState
  employee: EmployeeState
}

/** Typed dispatch for Redux - includes ThunkMiddleware */
import type { ThunkDispatch } from '@reduxjs/toolkit'

export type AppDispatch = ThunkDispatch<RootState, unknown, import('redux').AnyAction>

// =============================================================================
// Form Types
// =============================================================================

/** Password change form data */
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/** Forgot password form data */
export interface ForgotPasswordData {
  email: string
}

/** Reset password form data */
export interface ResetPasswordData {
  password: string
  confirmPassword: string
}

// =============================================================================
// Toast/Notification Types
// =============================================================================

/** Toast notification */
export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

/** Toast context type */
export interface ToastContextType {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

// =============================================================================
// Component Common Types
// =============================================================================

/** Common button variants */
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

/** Common button sizes */
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

/** Dialog size variants */
export type DialogSize = 'sm' | 'default' | 'lg' | 'xl' | 'full'

/** Card props */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/** Input props */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional custom props if needed
}

/** Label props */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // Additional custom props if needed
}