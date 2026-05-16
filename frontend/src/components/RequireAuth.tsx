import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

interface RequireAuthProps {
  children: React.ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { token } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}