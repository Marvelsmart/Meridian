import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isManagerCodeUnlocked } from '@/config/demo'

/** Redirects unauthenticated visitors to sign-in, remembering the destination. */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return children
}

/** Keeps signed-in users out of the auth pages. */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />
  return children
}

/**
 * Guards the signup form behind the demo Bank Manager Code gate.
 *
 * The gate itself lives at `/register`; typing the code there unlocks the tab
 * session (see `config/demo.js`). Anyone landing on `/register/account`
 * directly is sent back to enter the code, exactly like the intended flow:
 *
 *   Sign Up → Bank Manager Code → valid code → signup form
 */
export function ManagerCodeGuard({ children }) {
  const location = useLocation()
  if (!isManagerCodeUnlocked()) {
    return <Navigate to="/register" replace state={{ from: location.pathname }} />
  }
  return children
}
