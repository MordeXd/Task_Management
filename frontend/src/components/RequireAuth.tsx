import { Navigate, useLocation, type Location } from 'react-router-dom'
import { useAppSelector } from '../hooks/useRedux'

interface RequireAuthProps {
  children: React.ReactNode
}

interface LocationState {
  from: Location
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const token = useAppSelector((state) => state.auth.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location } as LocationState} replace />
  }

  return <>{children}</>
}