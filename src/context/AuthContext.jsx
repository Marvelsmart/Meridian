import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '@/lib/api'

const AuthContext = createContext(null)

/**
 * Session state only — no real authentication is performed in this phase.
 * `lib/api.js` validates the credentials against the mock store and returns a
 * token that we persist so a refresh keeps the user signed in.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => api.currentSession())
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const signIn = useCallback(async (credentials) => {
    setStatus('loading')
    setError(null)
    try {
      const next = await api.login(credentials)
      api.persistSession(next)
      setSession(next)
      return next
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setStatus('idle')
    }
  }, [])

  const signUp = useCallback(async (payload) => {
    setStatus('loading')
    setError(null)
    try {
      const next = await api.register(payload)
      api.persistSession(next)
      setSession(next)
      return next
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setStatus('idle')
    }
  }, [])

  const signOut = useCallback(async () => {
    await api.logout()
    api.persistSession(null)
    setSession(null)
  }, [])

  const resetDemo = useCallback(() => {
    api.resetDemoData()
    api.persistSession(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      error,
      isAuthenticated: Boolean(session?.token),
      signIn,
      signUp,
      signOut,
      resetDemo,
    }),
    [session, status, error, signIn, signUp, signOut, resetDemo],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
