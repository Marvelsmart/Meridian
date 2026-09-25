import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '@/lib/api'

const AuthContext = createContext(null)

/**
 * Session state for the backend-issued JWT returned by `lib/api.js`.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = api.currentSession()
    if (stored?.token?.startsWith('mdn_')) {
      api.persistSession(null)
      return null
    }
    return stored
  })
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
