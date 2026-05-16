import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import RequireAuth from './components/RequireAuth'

function App() {
  const { token } = useSelector((state: RootState) => state.auth)

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/forgot-password"
        element={token ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />}
      />
      <Route
        path="/reset-password/:token"
        element={token ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />}
      />
      <Route
        path="/change-password"
        element={
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App