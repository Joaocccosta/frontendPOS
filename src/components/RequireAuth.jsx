import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RequireAuth({ children }) {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-gray-100 text-gray-500">
        A carregar…
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile.mustChangePassword && location.pathname !== '/alterar-password') {
    return <Navigate to="/alterar-password" replace />
  }

  return children
}

export default RequireAuth
